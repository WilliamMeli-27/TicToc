import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const db = firestore();
export { auth };
// Note: database (Realtime) n'est pas utilisé dans les autres services pour l'instant
