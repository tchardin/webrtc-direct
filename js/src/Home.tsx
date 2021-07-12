import * as React from 'react';
import {useState} from 'react';
import styles from './Home.module.css';
import {useEcho} from './echo';
import {multiaddr} from 'multiaddr';
import PeerId from 'peer-id';

export default function Home() {
  const [peerAddr, setPeerAddr] = useState<string>('');
  const {echo, dial, loaded} = useEcho();

  const handleDial = () => {
    if (!loaded) {
      console.error('could not load libp2p node');
      return;
    }
    const addr = multiaddr(peerAddr);
    dial(addr);
  };

  const handleEcho = () => {
    if (!loaded) {
      console.error('could not load libp2p node');
      return;
    }
    const addr = multiaddr(peerAddr);
    const pidStr = addr.getPeerId();
    if (!pidStr) {
      return;
    }
    const pid = PeerId.createFromB58String(pidStr);

    echo(pid, 'hello world');
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>WebRTC Direct Tester</h1>

        <p className={styles.description}>
          Paste the peer address from the go node in the input below.
        </p>

        <div className={styles.grid}>
          <input
            type="text"
            name="addrs"
            value={peerAddr}
            placeholder="/ip4/127.0.0.1/tcp/60834/http/p2p-webrtc-direct/p2p/12D3KooWF4Tda3GXUAegZ4Qt5yzG6qQEjWt9Z2N5NVkunzsn8Zaf"
            onChange={(e) => setPeerAddr(e.target.value)}
          />

          <div className={styles.card} onClick={handleDial}>
            <h2>Dial &rarr;</h2>
            <p>Dial peer</p>
          </div>

          <div className={styles.card} onClick={handleEcho}>
            <h2>Echo &rarr;</h2>
            <p>Send echo message to peer</p>
          </div>
        </div>
      </main>
    </div>
  );
}
