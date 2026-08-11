import colors from './colors';
import spacing from './spacing';
import fonts from './fonts';

const shadows = {
  low: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  high: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
};

const radii = {
  small: 8,
  medium: 16,
  large: 24,
  pill: 999,
};

export { colors, spacing, fonts, shadows, radii };
export default { colors, spacing, fonts, shadows, radii };
