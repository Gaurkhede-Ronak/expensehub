import "../../style/loader.css";
 
const Loader = () => {
    return (
<div className="app-loader">
<div className="loader-content">
<div className="loader-logo">
<span>₹</span>
</div>
 
                <h4>Expense Manager</h4>
 
                <p>Managing your money, made simple.</p>
 
                <div className="loader-spinner">
<div className="spinner-ring"></div>
</div>
 
                <span className="loader-text">Please wait...</span>
</div>
</div>
    );
};
 
export default Loader;