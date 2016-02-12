import React, { PropTypes } from 'react';
import Card from 'components/Card/Card';
import Avatar from 'react-toolbox/lib/avatar';
import StarRating from 'react-star-rating';
import classNames from 'classnames';
import { Link } from 'react-router';

const Lunch = ({className, lunch}) => {
  const {cook} = lunch;
  const styles = require('./Lunch.scss');

  return (
    <Link to={`/lunches/${lunch.id}`} className={classNames(styles.lunch, className)}>
      <Card className={styles.card}>
        <div className={styles.photoWrapper}>
          <img className={styles.photo} src={lunch.photos[0].url} />
          <div className={styles.dishes}>
            {lunch.dishes.map(dish =>
              <div key={dish.id} className={styles.dish}>{dish.name}</div>
            )}
          </div>
        </div>

        <div className={styles.bottom}>
          <Avatar image={cook.main_photo.thumb.url} />
          <div>
            <div className={styles.cookName}>{cook.first_name + ' ' + cook.last_name}</div>
            <div className={styles.rating}>
              <StarRating className={styles.starRating} name="cook-rating" totalStars={5} editing={false} rating={3} size={13} />
              <span className={styles.feedback}>31 отзыв</span>
            </div>
          </div>
          <div className={styles.price}>
            <span className={styles.priceAmount}>40</span>
            <span className={styles.priceCurrency}>грн</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

Lunch.propTypes = {
  className: PropTypes.string,
  lunch: PropTypes.object
};

export default Lunch;
