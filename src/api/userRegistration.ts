// src/api/userRegistration.ts
import express from 'express'
import { userEventEmitter } from '../events/userEvents'
import { type User } from '../types/user'

const router = express.Router()

let allUsers: User[] = [
  /* existing users */
]

router.post('/register', (req, res) => {
  const newUser: User = req.body

  // Add new user to the user pool
  allUsers.push(newUser)

  // Emit the 'newUser' event, which triggers the scheduling
  userEventEmitter.emit('newUser', newUser)

  res.send('User registered and email schedule updated.')
})

export default router
