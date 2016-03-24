import React, { Component, PropTypes } from 'react';
import Navigation from 'react-toolbox/lib/navigation';
import Button from 'components/Button/Button';
import { connect } from 'react-redux';
import { open as openModal } from 'redux/modules/modals';
import HeaderMenu from 'components/HeaderMenu/HeaderMenu';
import SocialButton from 'components/SocialButton/SocialButton';

const menuLinks = [
  // {to: '/terms', label: 'Условия использования'},
  {to: '/about', label: 'Как это работает'},
  {to: '/', label: 'Меню', index: true},
  {to: '/about', label: 'О Нас'}
];

@connect(null, {openModal})
export default class Footer extends Component {
  static propTypes = {
    openModal: PropTypes.func.isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  openLoginModal = () => {
    this.props.openModal('LoginForm', 'Авторизация');
  };

  render() {
    const styles = require('./Footer.scss');

    return (
      <footer className={styles.footer}>
        <div className={styles.firstLine}>
          <HeaderMenu className={styles.menu} links={menuLinks}/>

          <Navigation className={styles.loginSignUp}>
            <Button flat accent label="Войти" onClick={this.openLoginModal} />
            <Button flat outlined label="Зарегистрироваться" onClick={() => this.context.router.push('/join')}/>
          </Navigation>
        </div>

        <div className={styles.secondLine}>
          <div className={styles.terms}>
            2016 Appetini. Все права защищены и соблюдены.
          </div>
          <Navigation className={styles.social}>
            <span className={styles.socialLabel}>Присоединяйтесь к нам: </span>
            <div className={styles.socialButtons}>
              <SocialButton className={styles.socialButton} name="vk"
                            href="http://vk.com/appetini" target="_blank"/>
              <SocialButton className={styles.socialButton} name="fb"
                            href="https://www.facebook.com/appetinicom/" target="_blank"/>
              <SocialButton className={styles.socialButton} name="instagram"
                            href="https://www.instagram.com/appetinicom/" target="_blank"/>
            </div>
          </Navigation>
        </div>
      </footer>
    );
  }
}
