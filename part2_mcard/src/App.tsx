import React from 'react';
import './App.css';
import Text from '@shared/Text';
import Button from '@shared/Button';

function App() {
  return (
    <div>
      <Text typography="t1" display="block" color="red">
        t1
      </Text>
      <Text typography="t2" color="blue">
        t2
      </Text>
      <Text typography="t3">t3</Text>
      <Text typeof="t4">t4</Text>
      <Text>t5</Text>

      <div style={{ height: 10, width: '100%', background: '#efefef' }}>
        <Button>클릭해주세요</Button>
        <Button color="success">클릭해주세요</Button>
        <Button color="error">클릭해주세요</Button>
        <Button color="success" weak={true}>
          클릭해주세요
        </Button>
        <Button color="error" weak={true}>
          클릭해주세요
        </Button>
        <Button full={true}>클릭해주세요</Button>
        <Button full={true} disabled={true}>
          클릭해주세요
        </Button>
        <Button>클릭해주세요</Button>
      </div>
    </div>
  );
}

export default App;
