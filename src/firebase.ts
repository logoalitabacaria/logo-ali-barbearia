import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  INITIAL_SYSTEM_PARAMETERS,
  INITIAL_USERS,
  INITIAL_BARBER_DETAILS,
  INITIAL_SERVICES,
  INITIAL_PRODUCTS,
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_COMANDAS
} from './data';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Test Connection (Critical requirement)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// DB State Sync Functions
// ----------------------------------------------------

export async function loadStateFromFirestore() {
  try {
    // 1. Fetch Users
    const usersSnap = await getDocs(collection(db, 'users')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'users');
      return { docs: [] };
    });
    let usersList = usersSnap.docs.map(d => d.data());

    // 2. Fetch Barber Details
    const bSnap = await getDocs(collection(db, 'barberDetails')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'barberDetails');
      return { docs: [] };
    });
    let barberDetailsList = bSnap.docs.map(d => d.data());

    // 3. Fetch Services
    const sSnap = await getDocs(collection(db, 'services')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'services');
      return { docs: [] };
    });
    let servicesList = sSnap.docs.map(d => d.data());

    // 4. Fetch Products
    const pSnap = await getDocs(collection(db, 'products')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'products');
      return { docs: [] };
    });
    let productsList = pSnap.docs.map(d => d.data());

    // 5. Fetch Plans
    const plSnap = await getDocs(collection(db, 'plans')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'plans');
      return { docs: [] };
    });
    let plansList = plSnap.docs.map(d => d.data());

    // 6. Fetch Subscriptions
    const subSnap = await getDocs(collection(db, 'subscriptions')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'subscriptions');
      return { docs: [] };
    });
    let subscriptionsList = subSnap.docs.map(d => d.data());

    // 7. Fetch Appointments
    const aptSnap = await getDocs(collection(db, 'appointments')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'appointments');
      return { docs: [] };
    });
    let appointmentsList = aptSnap.docs.map(d => d.data());

    // 8. Fetch Comandas
    const cmdSnap = await getDocs(collection(db, 'comandas')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'comandas');
      return { docs: [] };
    });
    let comandasList = cmdSnap.docs.map(d => d.data());

    // 9. Fetch parameters
    const paramDoc = await getDoc(doc(db, 'parameters', 'system')).catch(err => {
      handleFirestoreError(err, OperationType.GET, 'parameters/system');
    });
    let parametersData = paramDoc && paramDoc.exists() ? paramDoc.data() : null;

    // 10. Fetch categories
    const catDoc = await getDoc(doc(db, 'categories', 'list')).catch(err => {
      handleFirestoreError(err, OperationType.GET, 'categories/list');
    });
    let categoriesList = catDoc && catDoc.exists() ? catDoc.data().values : null;

    // IF FIRESTORE IS COMPLETELY EMPTY (FIRST RUN), BOOTSTRAP IT WITH INITIAL_DATA!
    const isDbEmpty = usersList.length === 0 && servicesList.length === 0;

    if (isDbEmpty) {
      console.log("Firestore is empty. Bootstrapping data...");
      await bootstrapEmptyDb();
      return {
        users: INITIAL_USERS,
        barberDetails: INITIAL_BARBER_DETAILS,
        services: INITIAL_SERVICES,
        products: INITIAL_PRODUCTS,
        plans: INITIAL_PLANS,
        subscriptions: INITIAL_SUBSCRIPTIONS,
        appointments: INITIAL_APPOINTMENTS,
        comandas: INITIAL_COMANDAS,
        parameters: INITIAL_SYSTEM_PARAMETERS,
        categories: ['HAIR', 'BEARD', 'COMBO', 'TREATMENT']
      };
    }

    return {
      users: usersList,
      barberDetails: barberDetailsList,
      services: servicesList,
      products: productsList,
      plans: plansList,
      subscriptions: subscriptionsList,
      appointments: appointmentsList,
      comandas: comandasList,
      parameters: parametersData || INITIAL_SYSTEM_PARAMETERS,
      categories: categoriesList || ['HAIR', 'BEARD', 'COMBO', 'TREATMENT']
    };
  } catch (error) {
    console.error("Error loading Firestore state:", error);
    return null;
  }
}

// Write the INITIAL values to clean databases
async function bootstrapEmptyDb() {
  try {
    for (const u of INITIAL_USERS) {
      await setDoc(doc(db, 'users', u.id), u);
    }
    for (const b of INITIAL_BARBER_DETAILS) {
      // Create safe ID for barberDetails using barber's userId
      await setDoc(doc(db, 'barberDetails', b.userId), b);
    }
    for (const s of INITIAL_SERVICES) {
      await setDoc(doc(db, 'services', s.id), s);
    }
    for (const p of INITIAL_PRODUCTS) {
      await setDoc(doc(db, 'products', p.id), p);
    }
    for (const pl of INITIAL_PLANS) {
      await setDoc(doc(db, 'plans', pl.id), pl);
    }
    for (const sub of INITIAL_SUBSCRIPTIONS) {
      await setDoc(doc(db, 'subscriptions', sub.id), sub);
    }
    for (const apt of INITIAL_APPOINTMENTS) {
      await setDoc(doc(db, 'appointments', apt.id), apt);
    }
    for (const cmd of INITIAL_COMANDAS) {
      await setDoc(doc(db, 'comandas', cmd.id), cmd);
    }
    await setDoc(doc(db, 'parameters', 'system'), INITIAL_SYSTEM_PARAMETERS);
    await setDoc(doc(db, 'categories', 'list'), { values: ['HAIR', 'BEARD', 'COMBO', 'TREATMENT'] });
    console.log("Bootstrapped successfully to Firestore!");
  } catch (error) {
    console.error("Bootstrap error:", error);
  }
}

// Sync updates to Firestore
export async function saveDocumentToFirestore(collectionName: string, id: string, data: any) {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, data);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${id}`);
  }
}

export async function deleteDocumentFromFirestore(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

// Clear all simulation records and reset Firestore + local state to clean production defaults
export async function clearDatabaseToProduction() {
  const collectionsToClear = ['users', 'barberDetails', 'services', 'products', 'plans', 'subscriptions', 'appointments', 'comandas'];
  for (const colName of collectionsToClear) {
    try {
      const snap = await getDocs(collection(db, colName));
      for (const d of snap.docs) {
        if (colName === 'users' && d.id === 'usr-admin') {
          continue;
        }
        await deleteDoc(doc(db, colName, d.id));
      }
    } catch (e) {
      console.error(`Error clearing collection ${colName}:`, e);
    }
  }

  // Restore main admin to users
  const adminObj = INITIAL_USERS.find(u => u.id === 'usr-admin') || {
    id: 'usr-admin',
    name: 'Logo Ali Barbearia (Administrador)',
    email: 'logoalitabacaria@gmail.com',
    role: 'ADMIN',
    phone: '(11) 99999-9999',
    isActive: true,
    avatar: '👑',
    login: 'admin',
    password: 'Logoali123!',
    permissions: ['VIEW_BILLING', 'EDIT_COMMISSIONS', 'MANAGE_USERS', 'MANAGE_APPOINTMENTS', 'EDIT_COMANDAS', 'CHECKOUT_COMANDAS', 'CUSTOMER_PORTAL']
  };
  await setDoc(doc(db, 'users', 'usr-admin'), adminObj);

  // Set parameters and categories to standard default
  await setDoc(doc(db, 'parameters', 'system'), INITIAL_SYSTEM_PARAMETERS);
  await setDoc(doc(db, 'categories', 'list'), { values: ['HAIR', 'BEARD', 'COMBO', 'TREATMENT'] });

  // Clear localStorage backups
  try {
    localStorage.clear();
  } catch (e) {
    console.error(e);
  }
}
