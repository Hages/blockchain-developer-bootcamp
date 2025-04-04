import { useDispatch, useSelector } from "react-redux";
import Blockies from "react-blockies";
import { loadAccount } from "../store/interactions";
import logo from "../assets/logo.png";
import eth from "../assets/eth.svg";
import config from "../config.json";

const Navbar = () => {
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.provider.connection);
  const chainId = useSelector((state) => state.provider.chainId);
  const account = useSelector((state) => state.provider.account);
  const balance = useSelector((state) => state.provider.balance);

  const connectHandler = async () => {
    await loadAccount(provider, dispatch);
  };

  const networkHandler = async (e) => {
    console.log("networkHandler", e.target.value);
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: e.target.value }],
    });
    window.location.reload();
  };

  return (
    <div className="exchange__header grid">
      <div className="exchange__header--brand flex">
        <img className="logo" src={logo} alt="Logo" />
        <h1>Hages' Token Exchange</h1>
      </div>

      <div className="exchange__header--networks flex">
        <img src={eth} alt="ETH Logo" className="Eth Logo" />
        {chainId && (
          <select
            name="networks"
            id="networks"
            value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
            onChange={networkHandler}
          >
            <option value="0" disabled>
              Select Network
            </option>
            <option value="0x7a69">Localhost</option>
            <option value="0xaa36a7">Sepolia</option>
          </select>
        )}
      </div>

      <div className="exchange__header--account flex">
        {balance ? (
          <p>
            <small>My Balance</small>
            {Number(balance).toFixed(4)} ETH
          </p>
        ) : (
          <p>
            <small>My Balance</small> 0 ETH
          </p>
        )}
        {account ? (
          <a
            href={
              config[chainId]
                ? `${config[chainId].explorerUrl}/address/${account}`
                : `#`
            }
            target="_blank"
            rel="noreferrer"
          >
            {account.slice(0, 6) + "..." + account.slice(-4)}
            <Blockies
              seed={account}
              size={10}
              scale={3}
              color="#2187d0"
              bgColor="#f1f2f9"
              spotColor="#767f92"
              className="identicon"
            />
          </a>
        ) : (
          <button className="button" onClick={connectHandler}>
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
