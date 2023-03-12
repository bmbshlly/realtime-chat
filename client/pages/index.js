import { useState, useEffect } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log(count);
    return () => console.log('cleanup');
  }, [count]);

  useEffect(() => {
    console.log('d 2');
  }, []);
  useEffect(() => {
    console.log('d 1');
    return () => console.log('d 1 return ');
  });

  return (
    <div>
      {console.log('render', count)}
      <input
        onChange={(e) => {
          setInput(e.target.value);
          setCount(count + 1);
          console.log('clicked');
        }}
        value={input}
      />
    </div>
  );
}
