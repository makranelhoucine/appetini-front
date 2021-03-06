import React, { Component, PropTypes } from 'react';
import { asyncConnect } from 'redux-async-connect';

import ResourcesIndex from 'components/ResourcesIndex/ResourcesIndex';

@asyncConnect([
  {key: 'cooks', promise: ({ helpers }) => helpers.client.get('/cooks')}
])
export default class Cooks extends Component {
  static propTypes = {
    cooks: PropTypes.object.isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  render() {
    const { resources: cooks } = this.props.cooks;
    const fields = [
      { title: 'ID', value: cook => cook.id },
      { title: 'Фото', type: 'image', value: cook => cook.main_photo.thumb.url },
      { title: 'Имя', value: cook => cook.first_name },
      { title: 'Фамилия', value: cook => cook.last_name }
    ];
    const defaultActions = ['edit'];
    const actions = [{
      linkTo: (id) => `/cooks/${id}/orders`,
      title: 'Заказы'
    }];

    return (<ResourcesIndex resources={cooks} title="Кулинары" createTitle="Создать кулинара"
                            urlName="/admin/cooks" fields={fields}
                            customActions={actions} defaultActions={defaultActions}/>);
  }
}
