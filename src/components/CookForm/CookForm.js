import React, { PropTypes, Component } from 'react';
import Input from 'components/Input/Input';
import Button from 'components/Button/Button';
import MultiImagesField from 'components/ImageField/MultiImagesField';
import ImageField from 'components/ImageField/ImageField';
import AddressSuggest from 'components/AddressSuggest/AddressSuggest';
import { show as showToast} from 'redux/modules/toast';
import { reduxForm } from 'redux-form';
import classNames from 'classnames';
import styles from './styles.scss';

@reduxForm(
  {
    form: 'cookForm',
    fields: ['id', 'main_photo_temp_image_id', 'other_photos_temp_image_ids', 'removing_other_photos',
      'first_name', 'last_name', 'other_photos', 'main_photo', 'location_attributes', 'location']
  }, null, {showToast}
)
export default class CookForm extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    showToast: PropTypes.func.isRequired,
    error: PropTypes.object,
    submitting: PropTypes.bool,
    title: PropTypes.string.isRequired,
    sendLabel: PropTypes.string.isRequired
  };

  onDrop(files) {
    files.forEach(file => {
      this.context.client.post('/temp_images', { attach: {'resource[image]': file} }).then(responce => {
        this.setState({ tempImage: responce.resource });
      }).catch(() => this.props.showToast('Ошибка при добавлении картинки'));
    });
  }

  handleSuggestSelect(suggest) {
    this.props.fields.location_attributes.onChange(suggest);
  }

  removeOtherPhoto(index, photos) {
    this.props.fields.removing_other_photos.onChange(photos);
  }

  handleOtherTempImages(tempImages) {
    this.props.fields.other_photos_temp_image_ids.onChange(tempImages.map(item => item.id));
  }

  handleMainTempImage(tempImage) {
    this.props.fields.main_photo_temp_image_id.onChange(tempImage && tempImage.id);
  }

  errorsFor(fieldName) {
    const { fields } = this.props;
    return fields[fieldName].error && !fields[fieldName].visited &&
      <div className={styles.error}>{fields[fieldName].error}</div>;
  }

  render() {
    const { fields, title, handleSubmit, submitting, sendLabel } = this.props;

    return (
      <form className={styles.root} onSubmit={handleSubmit}>
        <h1>{title}</h1>
        <div className={classNames(styles.section, styles.twoColSection)}>
          <div>
            <h3>Имя</h3>
            <Input {...fields.first_name}/>
          </div>
          <div>
            <h3>Фамилия</h3>
            <Input {...fields.last_name}/>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Основное фото</h3>
          <ImageField onTempImage={::this.handleMainTempImage} value={fields.main_photo.value}/>
          {this.errorsFor('main_photo')}
        </div>

        <div className={styles.section}>
          <h3>Другие фото</h3>
          <MultiImagesField onRemove={::this.removeOtherPhoto} onTempImages={::this.handleOtherTempImages}
                            value={fields.other_photos.value} removingImages={fields.removing_other_photos.value}
          />
          {this.errorsFor('other_photos')}
        </div>

        <div className={styles.section}>
          <h3>Адресс</h3>
          <AddressSuggest onSuggestSelect={::this.handleSuggestSelect}
                      initialValue={fields.location.value && fields.location.value.full_address}
          />
          {this.errorsFor('location')}
        </div>

        <div className={styles.submitContainer}>
          <Button flat accent label={sendLabel} type="submit" disabled={submitting}/>
        </div>

      </form>
    );
  }
}