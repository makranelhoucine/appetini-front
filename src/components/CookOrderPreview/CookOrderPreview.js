import React, {Component, PropTypes} from 'react';
import { Card } from 'react-toolbox/lib/card';
import moment from 'moment';
import { Link } from 'react-router';
import Button from 'components/Button/Button';
import ImagesPreview from 'components/ImagesPreview/ImagesPreview';
import styles from './styles.scss';
import { dots } from 'components/OrderItems/styles.scss';
import reduce from 'lodash/reduce';

export default class CookOrderPreview extends Component {
  static propTypes = {
    user: PropTypes.object,
    orders: PropTypes.array
  }

  totalPrice() {
    const { orders } = this.props;
    return reduce(orders, (sum, order) => {
      return sum + (parseFloat(order.resource.initial_price) * order.amount);
    }, 0);
  }

  render() {
    const { orders, user } = this.props;
    const showOrderLink = user && user.role === 'admin';
    return (
        <Card className={styles.orderPreviewWrapper}>
          {orders.length > 0 ?
            <table className={styles.table}>
              <thead>
                <tr>
                  <td>Номер</td>
                  <td>Дата</td>
                  <td>Время</td>
                  <td>Блюда</td>
                  <td className={styles.hiddenSm}>Фото</td>
                  <td>Цена</td>
                  <td>Количество</td>
                  {showOrderLink && <td>Заказ</td>}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, id) => {
                  return (
                    <tr key={id}>
                      <td>{order.order_id}</td>
                      <td>{moment(order.resource.ready_by).format('DD MMMM')}</td>
                      <td>{moment(order.resource.ready_by).format('HH:mm')}</td>
                      <td>
                        {order.resource.dishes.map((dish, index) => {
                          return (<div key={index} className={styles.dish}>
                            <span className={styles.dishName}>{dish.name}</span>
                            <span className={dots}/>
                            <span>{dish.size}</span></div>);
                        })}
                      </td>
                      <td className={styles.hiddenSm}>
                        <div className={styles.photoWrapper}>
                          <ImagesPreview images={order.resource.photos} currentImageId={0}/>
                        </div>
                      </td>
                      <td>{order.resource.initial_price * order.amount} грн.</td>
                      <td>{order.amount}</td>
                      {showOrderLink && <td><Link to={`/orders/${order.order_id}`}><Button flat accent label="Заказ"/></Link></td>}
                    </tr>);
                })}
              </tbody>
              <tbody>
                <tr>
                  <td colSpan="4"/>
                  <td colSpan="2">Общая стоимость: </td>
                  <td colSpan={showOrderLink ? 2 : 1}>{this.totalPrice()} грн.</td>
                </tr>
              </tbody>
            </table>
            : <h2 className={styles.ordersPlaceholder}>Нет заказов</h2>
          }
        </Card>
    );
  }
}
