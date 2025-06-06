export default function GoalsPage() {
  // Log to the browser console when this component renders
  console.log("[CLIENT] GoalsPage is rendering")

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Goals Calculator</h1>
      <div className="p-4 border-2 border-blue-500 rounded-md mb-4 bg-blue-50">
        <p className="text-blue-800">This is a simplified test page for the Goals Calculator.</p>
      </div>
    </div>
  )
}
