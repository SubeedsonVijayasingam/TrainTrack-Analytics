import './App.css'

function App() {
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

        <section className="roles">
          <h2>System Users</h2>

          <div className="role-grid">
            <div className="role-card">
              <h3>HR / Admin</h3>
              <p>
                Create training programs, assign employees, monitor progress,
                and view effectiveness analytics.
              </p>
            </div>

            <div className="role-card">
              <h3>Employee</h3>
              <p>
                Complete training, take assessments, and submit self-evaluation
                about workplace skill application.
              </p>
            </div>

            <div className="role-card">
              <h3>Manager</h3>
              <p>
                Evaluate employee workplace performance and provide feedback on
                skill application.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App

