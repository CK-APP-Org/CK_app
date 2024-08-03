import { boot } from 'quasar/wrappers'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAfHEWoaKuz8fiMKojoTEeJWMUzJDgiuVU",
  authDomain: "ck-app-database.firebaseapp.com",
  projectId: "ck-app-database",
  storageBucket: "ck-app-database.appspot.com",
  messagingSenderId: "253500838094",
  appId: "1:253500838094:web:b6bfcf4975f3323ab8c09f",
  measurementId: "G-T79H6D7WRT"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export default boot(({ app }) => {
  app.config.globalProperties.$firebase = app
  app.config.globalProperties.$db = db
  app.config.globalProperties.$auth = auth
})

export { db, auth }
