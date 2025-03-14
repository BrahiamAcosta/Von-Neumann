import "../styles/DataField.css";

function DataField({ name, data }) {
  return (
    <div className="data_field_container">
      <h3>{name}</h3>
      <p>{data}</p>
    </div>
  );
}

export default DataField;
