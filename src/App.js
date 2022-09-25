import React, { useEffect, useCallback, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import GifGrid from "./components/gifGrid";
import AddGif from "./components/AddGif";
import { Blocks } from "react-loader-spinner";
import kp from './keypair.json'
// Constants
const { SystemProgram } = web3;
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret) 
const network = clusterApiUrl("devnet");
const programId = new PublicKey(process.env.REACT_APP_DEVNET_PROGRAM_ID);
const opts = {
  preflightCommitment: "processed",
};
const getProvider = () => {
  const connection = new Connection(network, opts.preflightCommitment);
  const provider = new Provider(
    connection,
    window.solana,
    opts.preflightCommitment
  );
  return provider;
};
const TEST_GIFS = [
  "https://media.giphy.com/media/l378BzHA5FwWFXVSg/giphy.gif",
  "https://media.giphy.com/media/gk3R16JhLP8RUka2nD/giphy.gif",
  "https://media.giphy.com/media/RhNRsZgfkjzX3KzKyh/giphy.gif",
  "https://media.giphy.com/media/MaP59uYFYg66yHXK7h/giphy.gif",
];
const App = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [gifs, setGifs] = useState(null);
  const [loading, setLoading] = useState(true);

  const getGifList = useCallback(async () => {
    try {
      const program = await getProgram();
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );
      console.log("Got the account", account);
      setGifs(account.gifList);
      setLoading(false);
    } catch (err) {
      // alert(err);
      // setGifs(null);
      setLoading(false);
    }
  }, []);

  const createAccount = useCallback(async () => {
    setLoading(true);
    try {
      const provider = getProvider();
      const program = await getProgram();

      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );

      await getGifList();
    } catch (err) {
      alert(err);
      setLoading(false);
    }
  }, [getGifList]);

  const addGif = async (link) => {
    if (link.length > 0) {
      try {
        const program = await getProgram();
        const provider = getProvider();
        await program.rpc.addGif(link, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
          }
        });
        await getGifList();
      } catch (err) {
        alert(err);
      }
    }
  };
  const checkIfWalletExists = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          // setWallet(solana)
          console.log("phantom wallet installed");
          const response = await solana.connect({ onlyIfTrusted: true });
          setWalletAddress(response.publicKey.toString());
          console.log(
            "Connected with public key",
            response.publicKey.toString()
          );
        } else {
          alert("please install phantom wallet extension 👻");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const getProgram = async () => {
    let provider = getProvider();
    const idl = await Program.fetchIdl(programId, provider);
    return new Program(idl, programId, provider);
  };
  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log(response);
      if (response.publicKey) {
        setWalletAddress(response.publicKey.toString());
      }
    }
  };
  useEffect(() => {
    const onLoad = () => {
      checkIfWalletExists();
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    console.log('running ')
    if (walletAddress) {
      // setGifs(TEST_GIFS);
      getGifList();
    }
  }, [getGifList, walletAddress]);
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 Rick And Morty Everywhere</p>
          <p className="sub-text">
            View your Rick and Morty GIF collection in the metaverse ✨
          </p>
          {!walletAddress && !loading && (
            <button
              onClick={connectWallet}
              className=" cta-button connect-wallet-button"
            >
              Connect wallet
            </button>
          )}
          {gifs == null ? (
            loading ? (
              <Blocks
                visible={true}
                height="70"
                width="70"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
              />
            ) : (
              <button
                className="cta-button submit-gif-button"
                onClick={createAccount}
              >
                create Account
              </button>
            )
          ) : (
            <div className='grid-container'>
              {walletAddress && <AddGif addGif={addGif} />}
              {walletAddress && <GifGrid gifs={gifs} />}
            </div>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
