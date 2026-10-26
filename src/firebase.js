import { initializeApp } from 'firebase/app'
import {
    getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword
} from 'firebase/auth'
import {
    getFirestore, doc, getDoc, setDoc, updateDoc
} from 'firebase/firestore'

// Reads your existing Firebase settings from .env.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

const provider = new GoogleAuthProvider()

// Lets the user choose their Google account.
provider.setCustomParameters({
    prompt: 'select_account'
})

// Opens Google's sign-in popup.
export async function signinwithGoogle() {
    return await signInWithPopup(auth, provider)
}

// Creates an account using an email and password.
export async function signupwithemailandpassword(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password)
}

// Checks the email and password through Firebase Authentication.
export async function loginwithemailandpassword(email, password) {
    return await signInWithEmailAndPassword(auth, email, password)
}

// Saves a user's profile and fills in any missing profile fields.
export async function createUserDoc(userAuth, otherinfo) {
    const userDocRef = doc(db, 'users', userAuth.uid)
    const userSnapshot = await getDoc(userDocRef)

    const { displayName, email } = userAuth

    if (!userSnapshot.exists()) {
        await setDoc(userDocRef, {
            displayName,
            email,
            plan: 'Free',
            ...otherinfo
        })
    } else {
        const userDetails = userSnapshot.data()
        const updates = {}

        if (!userDetails.displayName && displayName) {
            updates.displayName = displayName
        }

        if (!userDetails.email && email) {
            updates.email = email
        }

        if (!userDetails.plan) {
            updates.plan = 'Free'
        }

        if (Object.keys(updates).length > 0) {
            await updateDoc(userDocRef, updates)
        }
    }
}