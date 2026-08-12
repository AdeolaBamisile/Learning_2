import NumberForm from "./NumberForm";

const Person = ({ person, onClose, setError }) => {
  if (!person) {
    return (
      <>
        <div>Person not found</div>
        <button onClick={onClose}>close</button>
      </>
    );
  }

  return (
    <>
      <h2>{person.name}</h2>
      <div>Street: {person.address.city}</div>
      <div>City: {person.address.city}</div>
      <div>{person.phone}</div>
      <button onClick={onClose}>close</button>
      <NumberForm name={person.name} setError={setError} />
    </>
  );
};

export default Person;
