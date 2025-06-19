import i18n from '../i18n';

export const formatDateTime = (dateStr) => {
  try {
    return new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateStr));
  } catch (e) {
    return dateStr; 
  }
};
