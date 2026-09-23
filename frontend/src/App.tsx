import { useEffect, useState } from 'react'
import './App.css'

type User = {
  _id: string
  name: string
  email: string
  password?: string
}

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  // ======================================================
  // Get all users
  // ======================================================
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users')
      const data = await response.json()

      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  // ======================================================
  // Load users when page opens
  // ======================================================
  useEffect(() => {
    fetchUsers()
  }, [])

  // ======================================================
  // Start editing a user
  // ======================================================
  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditName(user.name)
    setEditEmail(user.email)
  }

  // ======================================================
  // Update user
  // ======================================================
  const handleUpdate = async () => {
    if (!editingUser) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${editingUser._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editName,
            email: editEmail,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Failed to update user')
        return
      }

      setUsers(
        users.map((user) =>
          user._id === editingUser._id
            ? {
                ...user,
                name: editName,
                email: editEmail,
              }
            : user
        )
      )

      setEditingUser(null)
    } catch (error) {
      console.error('Failed to update user:', error)
      alert('Failed to update user')
    }
  }

  // ======================================================
  // Delete user
  // ======================================================
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Failed to delete user')
        return
      }

      setUsers(users.filter((user) => user._id !== id))
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>TrainTrack</h1>
          <p>Learning Outcome Evaluation System</p>
        </div>

        <button className="profile">HR Admin</button>
      </header>

      <main className="dashboard">
        <section className="welcome">
          <h2>Training Effectiveness Dashboard</h2>

          <p>
            Monitor employee training, assessments, and workplace skill
            application.
          </p>
        </section>

        <section className="stats">
          <div className="card">
            <h3>Total Trainings</h3>
            <strong>12</strong>
            <p>Active training programs</p>
          </div>

          <div className="card">
            <h3>Employees Trained</h3>
            <strong>186</strong>
            <p>Employees participating</p>
          </div>

          <div className="card">
            <h3>Completion Rate</h3>
            <strong>78%</strong>
            <p>Training completion</p>
          </div>

          <div className="card">
            <h3>Effectiveness</h3>
            <strong>82%</strong>
            <p>Overall effectiveness</p>
          </div>
        </section>

        {/* ==================================================
            System Users
        ================================================== */}

        <section className="roles">
          <h2>System Users</h2>

          {loading ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="role-grid">
              {users.map((user) => (
                <div className="role-card" key={user._id}>
                  <h3>{user.name}</h3>

                  <p>{user.email}</p>

                  <div>
                    <button onClick={() => handleEdit(user)}>
                      Edit
                    </button>

                    <button onClick={() => handleDelete(user._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ==================================================
            Edit User Form
        ================================================== */}

        {editingUser && (
          <section className="roles">
            <h2>Update User</h2>

            <div className="role-card">
              <label>
                Name
              </label>

              <input
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
              />

              <br />

              <label>
                Email
              </label>

              <input
                type="email"
                value={editEmail}
                onChange={(event) => setEditEmail(event.target.value)}
              />

              <br />

              <button onClick={handleUpdate}>
                Save Changes
              </button>

              <button onClick={() => setEditingUser(null)}>
                Cancel
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App