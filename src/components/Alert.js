import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { myEventsSelector } from "../store/selectors";
import config from "../config.json";

const Alert = () => {
  const alertRef = useRef(null);
  const network = useSelector((state) => state.provider.network);
  const account = useSelector((state) => state.provider.account);
  const isPending = useSelector(
    (state) => state.exchange.transaction.isPending
  );
  const isError = useSelector((state) => state.exchange.transaction.isError);
  const events = useSelector(myEventsSelector);

  const removeHandler = async (e) => {
    alertRef.current.className = "alert--remove";
  };

  useEffect(() => {
    if ((events[0] || isPending || isError) && account) {
      alertRef.current.className = "alert";
    }
  }, [events, isPending, isError, account]);

  return (
    <div>
      <div
        className="alert alert--remove"
        onClick={removeHandler}
        ref={alertRef}
      >
        {isPending ? (
          <h1>Transaction Pending...</h1>
        ) : isError ? (
          <h1>Transaction Will Fail</h1>
        ) : !isPending && events[0] ? (
          <div>
            <h1>Transaction Successful</h1>
            <a
              href={
                config[network]
                  ? `${config[network].explorerUrl}/tx/${events[0].transactionHash}`
                  : "#"
              }
              target="_blank"
              rel="noreferrer"
            >
              {events[0].transactionHash.slice(0, 6) +
                "..." +
                events[0].transactionHash.slice(60, 66)}
            </a>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default Alert;
