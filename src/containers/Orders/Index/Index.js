import React, { Component, PropTypes } from 'react';
import { asyncConnect } from 'redux-async-connect';
import { connect } from 'react-redux';
import ResourcesIndex from 'components/ResourcesIndex/ResourcesIndex';
import { updateOrder } from 'redux/modules/purchase';

const perPage = 10;
@asyncConnect([
  {key: 'orders', promise: ({ helpers, store }) => {
    const state = store.getState();
    const ordersQuery = state.routing.location.query;
    const ordersParams = { page: ordersQuery.page || 1, per_page: perPage };
    return helpers.client.get('/orders', { params: ordersParams })
      .then(orders => orders);
  }}
])

@connect( null, { updateOrder } )
export default class AdminOrdersIndex extends Component {
  static propTypes = {
    location: PropTypes.object,
    orders: PropTypes.object,
    updateOrder: PropTypes.func.isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired,
    client: PropTypes.object.isRequired
  };

  render() {
    const { orders, location } = this.props;
    const fields = [
      { title: 'Номер заказа', value: order => order.id },
      { title: 'Статус оплаты', value: order => order.payed ? 'Оплачен' : 'Не оплачен' },
      { title: 'Сумма заказа', value: order => Number(order.total_price) + ' грн' }
    ];

    const resources = orders ? orders.resources : [];
    const defaultActions = ['details'];
    const resourcesCount = orders && orders.meta.total;
    const pagination = {resourcesCount, perPage, currentPage: location.query.page};
    const actions = [{
      action: (id) => {
        this.context.client.get('/orders/' + id)
          .then(order => {
            this.props.updateOrder(order.resource);
          });
      },
      title: 'Редактировать',
      isDisabled: item => item.status !== 'pending'
    }];

    return (
      <ResourcesIndex resources={resources} title="История заказов" fields={fields}
        pagination={pagination} urlName="/orders" defaultActions={defaultActions} customActions={actions}/>
    );
  }
}
