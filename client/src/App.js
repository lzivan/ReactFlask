import React, {useEffect, useState} from "react";

function App() {

  const [data, setMessage] = useState([{}])

  useEffect(() => {
    fetch("/members").then(
      res => res.json()
    ).then(
        data => 
        setMessage(data))
        console.log(data)
  }, [])


  return (
    <div>
      {
        (typeof data.members === 'undefined') ? (
          <p>Loading...</p>
        )   : (
          data.members.map((member, index) => (
            <p key={index}>{member}</p>
          ))
        )     
      }
    </div>
  );
}

export default App;