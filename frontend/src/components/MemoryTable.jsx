function MemoryTable({ memory }) {
  return (
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
  );
}
export default MemoryTable;
