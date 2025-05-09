'use client'
import { useState } from 'react'
import UserForm from './components/UserForm'
import UserList from './components/UserList'
import Layout from './components/Layout'

export default function Home() {
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('form')

  return (
    <Layout>
      <div className="flex mb-8 border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'form' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('form')}
        >
          Add User
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'list' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('list')}
        >
          View Users
        </button>
      </div>

      {activeTab === 'form' ? (
        <UserForm onSuccess={() => setActiveTab('list')} />
      ) : (
        <UserList users={users} setUsers={setUsers} />
      )}
    </Layout>
  )
}