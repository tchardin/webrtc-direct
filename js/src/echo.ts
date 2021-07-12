import {useState, useEffect} from 'react';

import Libp2p, {HandlerProps} from 'libp2p';
import Websockets from 'libp2p-websockets';
import {NOISE} from 'libp2p-noise';
import Mplex from 'libp2p-mplex';
import {pipe} from 'it-pipe';
import PeerId from 'peer-id';
import WebRTCDirect from 'libp2p-webrtc-direct';
import fromString from 'uint8arrays/from-string';
import {Multiaddr} from 'multiaddr';

const ECHO_PROTOCOL = '/echo/1.0.0';

type EchoAPI = {
  id: string;
  loaded: boolean;
  echo: (peer: PeerId, msg: string) => void;
  dial: (addr: Multiaddr) => void;
};

export const useEcho = (): EchoAPI => {
  const [node, setNode] = useState<any>(null);

  const setupNode = async () => {
    try {
      const libp2p = await Libp2p.create({
        modules: {
          transport: [WebRTCDirect],
          connEncryption: [NOISE],
          streamMuxer: [Mplex],
        },
      });

      libp2p.on('peer:discovery', (peerId) =>
        console.log('Discovered', peerId.toB58String())
      );

      await libp2p.start();
      setNode(libp2p);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    setupNode();
  }, []);

  const echo = async (peerId: PeerId, msg: string) => {
    try {
      const {stream} = await node.dialProtocol(peerId, ECHO_PROTOCOL);
      await pipe([msg], stream, async function (source: Uint8Array[]) {
        // For each chunk of data
        for await (const data of source) {
          // Output the data
          console.log('received echo:', data.toString());
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  const dial = async (addr: Multiaddr) => {
    const pidStr = addr.getPeerId();
    if (!pidStr) {
      return;
    }
    const pid = PeerId.createFromB58String(pidStr);

    node.peerStore.addressBook.set(pid, [addr]);

    try {
      await node.dial(pid);
    } catch (e) {
      console.log(e);
    }
  };

  return node
    ? {
        id: node.peerId.toB58String(),
        loaded: true,
        echo,
        dial,
      }
    : {
        id: '',
        loaded: false,
        echo,
        dial,
      };
};
