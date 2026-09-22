import './App.css'
import Header from './components/Header'
import StatCard from './components/StatCard'
import RoleCard from './components/RoleCard'
import TrainingIcon from './components/TrainingIcon'

function App() {
  return (
    <div className="app">
      <Header />

      <main className="dashboard">
        <section className="welcome">
          <TrainingIcon />

          <h2>Training Effectiveness Dashboard</h2>

          <p>
            Monitor employee training, assessments, and workplace skill
            application.
          </p>
        </section>

        <section className="stats">
          <StatCard
            title="Total Trainings"
            value="12"
            description="Active training programs"
          />

          <StatCard
            title="Employees Trained"
            value="186"
            description="Employees participating"
          />

          <StatCard
            title="Completion Rate"
            value="78%"
            description="Training completion"
          />

          <StatCard
            title="Effectiveness"
            value="82%"
            description="Overall effectiveness"
          />
        </section>

        <section className="roles">
          <h2>System Users</h2>

          <div className="role-grid">
            <RoleCard
              title="HR / Admin"
              description="Create training programs, assign employees, monitor progress, and view effectiveness analytics."
            />

            <RoleCard
              title="Employee"
              description="Complete training, take assessments, and submit self-evaluation about workplace skill application."
            />

            <RoleCard
              title="Manager"
              description="Evaluate employee workplace performance and provide feedback on skill application."
            />
          </div>
        </section>
      </main>
    </div>
  )
}

export default App