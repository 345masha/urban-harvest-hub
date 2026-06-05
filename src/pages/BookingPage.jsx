
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../hooks/useBooking';
import { useLanguage } from '../context/LanguageContext';
import Modal from '../components/UI/Modal';
import './BookingPage.css';

function BookingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useBooking();

  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    const success = await handleSubmit(e);

    if (success) {
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        navigate('/');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-green-50 to-eco-sage-50 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="container mx-auto px-4">

        {submitted ? (
          <Modal
            title={t('bookingConfirmed')}
            onClose={() => navigate('/')}
          >
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✓</div>

              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {t('thankYou')} {formData.name}!
              </p>

              <p className="text-gray-600 dark:text-gray-400">
                {t('confirmationEmail')}{' '}
                <strong>{formData.email}</strong>
              </p>

              <button
                onClick={() => navigate('/')}
                className="btn-primary mt-6"
              >
                {t('back')} to Home
              </button>
            </div>
          </Modal>
        ) : (
          <>
            <header
              className="mb-12 text-center"
              role="banner"
            >
              <h1 className="text-4xl font-bold text-eco-green-800 dark:text-eco-green-100 mb-2">
                {t('subscribe')}
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300">
                Reserve your place at our eco-friendly workshops,
                events, or product subscriptions
              </p>
            </header>

            <div className="max-w-md mx-auto">
              <form
                onSubmit={onSubmit}
                className="card p-8"
                noValidate
              >

                {/* Name Field */}
                <div className="mb-6">
                  <label
                    htmlFor="name"
                    className="block font-semibold mb-2 text-gray-700 dark:text-gray-300"
                  >
                    {t('name')} <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="input-base"
                    aria-label={t('name')}
                    aria-invalid={!!errors.name}
                    aria-describedby={
                      errors.name ? 'name-error' : undefined
                    }
                  />

                  {errors.name && (
                    <span
                      id="name-error"
                      className="text-red-500 text-sm mt-1 block"
                      role="alert"
                    >
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* Email Field */}
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="block font-semibold mb-2 text-gray-700 dark:text-gray-300"
                  >
                    {t('email')} <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="input-base"
                    aria-label={t('email')}
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? 'email-error' : undefined
                    }
                  />

                  {errors.email && (
                    <span
                      id="email-error"
                      className="text-red-500 text-sm mt-1 block"
                      role="alert"
                    >
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* Phone Field */}
                <div className="mb-6">
                  <label
                    htmlFor="phone"
                    className="block font-semibold mb-2 text-gray-700 dark:text-gray-300"
                  >
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="input-base"
                  />

                  {errors.phone && (
                    <span className="text-red-500 text-sm mt-1 block">
                      {errors.phone}
                    </span>
                  )}
                </div>

                {/* Quantity Field */}
                <div className="mb-6">
                  <label
                    htmlFor="quantity"
                    className="block font-semibold mb-2 text-gray-700 dark:text-gray-300"
                  >
                    {t('quantity')}{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="input-base"
                    aria-label={t('quantity')}
                    aria-invalid={!!errors.quantity}
                    aria-describedby={
                      errors.quantity
                        ? 'quantity-error'
                        : undefined
                    }
                  />

                  {errors.quantity && (
                    <span
                      id="quantity-error"
                      className="text-red-500 text-sm mt-1 block"
                      role="alert"
                    >
                      {errors.quantity}
                    </span>
                  )}
                </div>

                {/* Special Requests */}
                <div className="mb-6">
                  <label
                    htmlFor="specialRequests"
                    className="block font-semibold mb-2 text-gray-700 dark:text-gray-300"
                  >
                    {t('specialRequests')}
                  </label>

                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests || ''}
                    onChange={handleChange}
                    placeholder="Any special dietary needs or requests?"
                    rows="4"
                    className="input-base resize-none"
                    aria-label={t('specialRequests')}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-busy={isSubmitting}
                >
                  {isSubmitting
                    ? t('loading')
                    : t('confirmSubscription')}
                </button>
              </form>

              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                <p>
                  {t('required')}:{' '}
                  <span className="text-red-500">*</span>
                </p>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default BookingPage;