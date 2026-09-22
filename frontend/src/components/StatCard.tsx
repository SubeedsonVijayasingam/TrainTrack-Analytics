interface StatCardProps {
  title: string
  value: string
  description: string
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <strong>{value}</strong>
      <p>{description}</p>
    </div>
  )
}

export default StatCard