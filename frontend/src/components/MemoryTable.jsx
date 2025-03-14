import "../styles/MemoryTable.css";

function MemoryTable({ memory }) {
  return (
    <div className="memory_table">
      <table>
        <thead>
          <tr>
            <th>Dirección</th>
            <th>Contenido</th>
          </tr>
        </thead>
        <tbody>
          {memory.map(([key, value], index) => (
            <tr key={index}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default MemoryTable;
