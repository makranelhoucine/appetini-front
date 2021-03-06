import React, { Component, PropTypes } from 'react';
import { asyncConnect, loadSuccess } from 'redux-async-connect';
import { connect } from 'react-redux';
import TeamLunch from 'components/TeamLunch/TeamLunch';
import Input from 'components/Input/Input';
import Button from 'components/Button/Button';
import { setTeamOrderUser } from 'redux/modules/teamOrderPreferences';
import { Modal } from 'components';
import { Link } from 'react-router';
import sumBy from 'lodash/sumBy';
import reduce from 'lodash/reduce';
import groupBy from 'lodash/groupBy';
import some from 'lodash/some';
import includes from 'lodash/includes';
import { addTeamOrder } from 'redux/modules/purchase';
import TeamOfferContainer from 'components/TeamOfferContainer/TeamOfferContainer';
import { show as showToast } from 'redux/modules/toast';
import styles from './styles.scss';
let pusher;
let channel;

function isOwner(location) {
  return /\/owner/.test(location.pathname);
}

const getLunchAmount = (lunch, user) => {
  const orderItemInfo = lunch.order_item_info;
  return reduce(orderItemInfo, (sum, item) => {
    return sum + (item.buyer_id === user.token ? item.amount : 0);
  }, 0);
};

const generateToken = () => {
  return Math.random().toString(36).substr(2);
};

const prepareLunches = (teamOrder) => {
  const orderItems = teamOrder.order_items_attributes;
  const lunches = teamOrder.team_offer.lunches;
  const groupedOrderItems = groupBy(orderItems, 'resource_id');
  return lunches.map(lunch => {
    return {...lunch, order_item_info: groupedOrderItems[lunch.id] || []};
  });
};

const totalPrice = (teamOrder) => {
  return reduce(prepareLunches(teamOrder), (sum, lunch) => {
    return sum + (lunch.price * sumBy(lunch.order_item_info, 'amount'));
  }, 0);
};

@asyncConnect([
  {key: 'teamOrder', promise: ({params, helpers, location }) => {
    return helpers.client.get(`/team_orders/${params.orderId}`, {params: {share_token: location.query.share_token}})
      .then(response => response.resource);}
  }
])
@connect(state => ({
  user: state.auth.user,
  teamOrderPreferences: state.teamOrderPreferences
}), { addTeamOrder, showToast, setTeamOrderUser, loadSuccess })
export default class TeamOrderShow extends Component {
  static propTypes = {
    teamOrder: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    addTeamOrder: PropTypes.func.isRequired,
    user: PropTypes.object,
    teamOrderPreferences: PropTypes.object,
    route: PropTypes.object.isRequired,
    showToast: PropTypes.func.isRequired,
    loadSuccess: PropTypes.func.isRequired,
    setTeamOrderUser: PropTypes.func.isRequired
  };

  static contextTypes = {
    client: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { user, teamOrder, teamOrderPreferences} = this.props;
    if (user && !teamOrderPreferences.user.token) {
      this.props.setTeamOrderUser({
        name: user.name,
        token: generateToken()
      });
    }
    if (teamOrderPreferences.user.token) {
      this.updateOrderItemsWithoutBuyer(teamOrderPreferences.user);
    }
    pusher = new window.Pusher('56a1adb1a911ea3d270c');
    channel = pusher.subscribe(`team_order__${teamOrder.share_token}__order_items`);
    channel.bind('order_items_changed', (data) => {
      const newOrder = {...teamOrder, order_items_attributes: JSON.parse(data.message)};
      this.props.loadSuccess('teamOrder', {...newOrder, price: totalPrice(newOrder)});
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.teamOrderPreferences.user !== this.props.teamOrderPreferences.user) {
      this.updateOrderItemsWithoutBuyer(nextProps.teamOrderPreferences.user);
    }
  }

  componentWillUnmount() {
    const { teamOrder } = this.props;
    channel.unbind('order_items_changed', () => pusher.unsubscribe(`team_order__${teamOrder.share_token}__order_items`));
  }

  onBuyHandle = () => {
    this.props.addTeamOrder(this.props.teamOrder);
    this.props.showToast('Корпоративный обед успешно добавлен в корзину', 'accept', 'done');
    this.context.router.push('/checkout');
  }

  setTeamOrderUser = (event) => {
    event.preventDefault();
    const { username } = this.state;
    if (username.length) {
      this.props.setTeamOrderUser({
        name: username,
        token: generateToken()
      });
    }
  }

  updateOrderItemsWithoutBuyer = (user) => {
    const { teamOrder } = this.props;
    const teamOrderItems = teamOrder.order_items_attributes;
    if (some(teamOrderItems, item => !item.buyer_name)) {
      const newOrderItems = teamOrderItems.map(item => {
        return item.buyer_name ? item : { ...item, buyer_id: user.token, buyer_name: user.name };
      });
      this.props.loadSuccess('teamOrder', {...teamOrder, order_items_attributes: newOrderItems});
      this.context.client.put(`team_orders/${teamOrder.id}`, {data: {
        resource: {
          ...teamOrder,
          order_items_attributes: newOrderItems
        },
        share_token: teamOrder.share_token}
      })
        .catch(() => {
          this.props.loadSuccess('teamOrder', teamOrder);
        });
    }
  }

  handleChangeAmount = (lunch, amount, buyerId, buyerName) => {
    const { teamOrder } = this.props;
    this.context.client.put(`/team_orders/${teamOrder.id}/order_items`, {data: {
      resource: {
        resource_id: lunch.id, amount: amount, resource_type: 'Lunch', buyer_id: buyerId, buyer_name: buyerName
      },
      share_token: teamOrder.share_token}
    })
    .then(response => {
      this.props.loadSuccess('teamOrder', {...response.resource, team_offer: teamOrder.team_offer});
    });
  }

  render() {
    const { teamOrder, location, user, teamOrderPreferences } = this.props;
    const { username } = this.state;
    const lunchesInTeamOrder = teamOrder.order_items_attributes;
    const teamOrderAmount = sumBy(lunchesInTeamOrder, (lunchInOrder) => lunchInOrder.amount);
    const disabled = !includes(teamOrderPreferences.ownerArray, teamOrder.id);

    return (
      <div className={styles.teamOrderWrapper}>
        {teamOrder.order_id
          ? <div className={styles.placeholder}>
              <h2>Данный заказ уже обработан</h2>
              <p>Вы можете заказать другой корпоративный обед</p>
              <Link className={styles.placeholderButton} to="/team_offers">
                <Button flat outlined label="Все корпоративные обеды"/>
              </Link>
            </div>
          : <TeamOfferContainer offer={teamOrder.team_offer} disabled={disabled}
                                totalPrice={teamOrder.price}
                                user={user}
                                shareLink={teamOrder.share_link}
                                orderedAmount={teamOrderAmount}
                                onBuy={::this.onBuyHandle}
                                hideExternalLinks={!isOwner(location)}>
              <div>
                <Modal.Dialog active={!teamOrderPreferences.user.token} onClose={() => {}} title="Введите ваше имя">
                  <form className={styles.userModal} onSubmit={::this.setTeamOrderUser}>
                    <Input value={username} className={styles.userInput} onChange={(value) => this.setState({username: value})} debounce={300} placeholder="Ваше имя"/>
                    <Button type="submit" className={styles.userButton} disabled={!username} flat onClick={::this.setTeamOrderUser} accent label="Продолжить"/>
                  </form>
                </Modal.Dialog>
                <div className={styles.lunchesWrapper}>
                  {prepareLunches(teamOrder).map((lunch, idx) => {
                    return (<TeamLunch key={idx} lunch={lunch} onChangeAmount={::this.handleChangeAmount} isOwner={isOwner(location)}
                                       amount={getLunchAmount(lunch, teamOrderPreferences.user)}/>);
                  })}
                </div>
              </div>
            </TeamOfferContainer>
        }
      </div>
    );
  }
}
