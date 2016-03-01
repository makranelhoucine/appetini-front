import React from 'react';
import {IndexRoute, Route} from 'react-router';
import {
    App,
    Home,
    About,
    LoginSuccess,
    NotFound,
    LunchDetails,
    AuthorizedApp,
    AdminDashboard,
    AdminLunches,
    AdminLunchesNew,
    AdminLunchesEdit,
    AdminOrders,
    AdminCooks,
    AdminCooksNew,
    AdminCooksEdit,
    Tariffs,
    Checkout
  } from 'containers';
import { setUser } from 'redux/modules/auth';

export default (store, client) => {
  const requireLogin = (nextState) => {
    const { user } = store.getState().auth;

    if (__SERVER__ && !user) {
      nextState.location.state = {...nextState.location.state, responseStatus: 403};
    }
  };

  const userLoad = (nextState, replaceState, cb) => {
    const state = store.getState();
    const { user } = state.auth;
    if (!user) {
      const userFromToken = state.auth.tokenPayload.user;
      if (userFromToken) {
        client.get('/users/' + userFromToken.id).then(result => {
          store.dispatch(setUser(result.resource));
          cb();
        }).catch(() => {
          cb();
        });
        return;
      }
    }
    cb();
  };

  /**
   * Please keep routes in alphabetical order
   */
  return (
    <Route path="/" component={App} onEnter={userLoad} client={client}>
      { /* Routes requiring login */ }
      <Route onEnter={requireLogin} component={AuthorizedApp}>
        { /* Home (main) route */ }
        <IndexRoute component={Home}/>
        <Route path="loginSuccess" component={LoginSuccess}/>
      </Route>

      { /* Routes */ }
      <Route path="about" component={About}/>

      <Route path="lunches/:lunchId" component={LunchDetails}/>

      <Route path="tariffs" component={Tariffs}/>
      <Route path="checkout" component={Checkout}/>

      <Route path="admin" onEnter={requireLogin} component={AuthorizedApp} authCondition={user => user && user.role === 'admin'}>
        <IndexRoute component={AdminDashboard}/>
        <Route path="orders" component={AdminOrders}/>
        <Route path="lunches" component={AdminLunches}/>
        <Route path="lunches/:lunchId/edit" component={AdminLunchesEdit}/>
        <Route path="lunches/new" component={AdminLunchesNew}/>
        <Route path="cooks" component={AdminCooks}/>
        <Route path="cooks/:cookId/edit" component={AdminCooksEdit}/>
        <Route path="cooks/new" component={AdminCooksNew}/>
      </Route>

      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404} />
    </Route>
  );
};
