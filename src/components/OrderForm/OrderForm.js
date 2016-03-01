import React, { PropTypes, Component } from 'react';
import Input from 'components/Input/Input';
import Button from 'components/Button/Button';
import AddressSuggest from 'components/AddressSuggest/AddressSuggest';
import OrderItems from 'components/OrderItems/OrderItems';
import { RadioGroup, RadioButton } from 'react-toolbox';
import { show as showToast } from 'redux/modules/toast';
import { removeOrderItem } from 'redux/modules/purchase';
import { reduxForm } from 'redux-form';
import styles from './styles.scss';

@reduxForm(
  {
    form: 'orderForm',
    fields: ['id', 'phone', 'location_attributes', 'location', 'payment_type']
  }, state => ({user: state.auth.user, orderItems: state.purchase.orderItems}),
  { showToast, removeOrderItem }
)
export default class OrderForm extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    showToast: PropTypes.func.isRequired,
    removeOrderItem: PropTypes.func.isRequired,
    error: PropTypes.object,
    submitting: PropTypes.bool,
    user: PropTypes.object,
    orderItems: PropTypes.array.isRequired,
    order: PropTypes.object
  };

  handleSuggestSelect(suggest) {
    this.props.fields.location_attributes.onChange(suggest);
  }

  errorsFor(fieldName) {
    const { fields } = this.props;
    return fields[fieldName].error && !fields[fieldName].visited &&
      <div className={styles.error}>{fields[fieldName].error}</div>;
  }

  handleRemoveItem(item) {
    this.props.removeOrderItem(item);
  }

  render() {
    const { fields, handleSubmit, submitting, user, orderItems, order } = this.props;
    const submitLabel = fields.payment_type.value === 'liqpay' ? 'Оплатить' : 'Оформить заказ';

    return (
      <form className={styles.root} onSubmit={handleSubmit}>
        <h1>Оформление заказа</h1>

        <div>
          <h3>Имя</h3>
          <Input value={user.name} disabled/>
        </div>

        <div>
          <h3>Телефон</h3>
          <Input value={user.phone} disabled/>
        </div>

        <div>
          <h3>Адресс</h3>
          <AddressSuggest onSuggestSelect={::this.handleSuggestSelect} disabled={Boolean(order)}
                          initialValue={fields.location.value && fields.location.value.full_address}
          />
          {this.errorsFor('location')}
        </div>

        <div>
          <h3>Ваш заказ:</h3>
          <OrderItems items={orderItems} onRemove={::this.handleRemoveItem}/>
        </div>

        <div>
          <h3>Способ оплаты:</h3>
          <RadioGroup className={styles.paymentType} {...fields.payment_type}>
            <RadioButton label="Наличными курьеру" value="cash"/>
            <RadioButton label="Кредитная карта, Приватбанк" value="liqpay"/>
          </RadioGroup>
          {this.errorsFor('payment_type')}
        </div>

        {!order && <div className={styles.submitContainer}>
          <Button flat accent label={submitLabel} type="submit" disabled={submitting}/>
        </div>}

      </form>
    );
  }
}