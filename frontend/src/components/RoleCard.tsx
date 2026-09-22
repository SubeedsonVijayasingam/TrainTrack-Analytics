interface RoleCardProps {
  title: string
  description: string
}

function RoleCard({ title, description }: RoleCardProps) {
  return (
    <div className="role-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

export default RoleCard