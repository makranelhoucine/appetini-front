require('babel/polyfill');
const moment = require('moment');

moment.locale('ru');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: process.env.APIHOST || 'localhost',
  apiPort: process.env.APIPORT,
  app: {
    title: 'Appetini',
    description: 'Сервис доставки вкусных домашних обедов каждый день',
    head: {
      titleTemplate: 'Appetini - доставка обедов: %s',
      meta: [
        {name: 'description', content: 'Сервис доставки вкусных домашних обедов каждый день'},
        {charset: 'utf-8'},
        {property: 'og:site_name', content: 'Appetini - доставка обедов Сумы'},
        {property: 'og:image', content: 'https://react-redux.herokuapp.com/logo.png'},
        {property: 'og:locale', content: 'en_US'},
        {property: 'og:title', content: 'Appetini - доставка обедов'},
        {property: 'og:description', content: 'Сервис доставки вкусных домашних обедов каждый день'},
        {property: 'og:card', content: 'summary'},
        {property: 'og:site', content: '@erikras'},
        {property: 'og:creator', content: '@erikras'},
        {property: 'og:image:width', content: '200'},
        {property: 'og:image:height', content: '200'}
      ]
    }
  }

}, environment);
