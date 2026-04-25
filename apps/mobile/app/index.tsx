import { Redirect } from 'expo-router';

import { AUTH_ROUTES } from '../screens/onboarding/content';

export default function IndexRoute() {
  return <Redirect href={AUTH_ROUTES.welcome} />;
}
