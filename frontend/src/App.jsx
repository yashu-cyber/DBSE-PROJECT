import { useEffect, useState } from "react";
import {
  Warehouse,
  Package,
  LockKeyhole,
  User,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  Truck,
  Building2,
  BarChart3,
  LogOut,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./App.css";

const authHeaders = () => {
  const token = sessionStorage.getItem("warehouseiq_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const API = "http://127.0.0.1:5050";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setMessage("Please enter your username and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem("warehouseiq_user", JSON.stringify(data.user));
        sessionStorage.setItem("warehouseiq_token", data.token);
        window.history.replaceState(null, "", window.location.href);
        onLogin(data.user);
      } else {
        setMessage(data.message || "Invalid username or password.");
      }
    } catch {
      setMessage("Unable to connect to the WarehouseIQ server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="visual-overlay" />

        <div className="brand">
          <div className="brand-mark">
            <Warehouse size={27} />
          </div>
          <div>
            <div className="brand-name">WarehouseIQ</div>
            <div className="brand-tagline">SMART WAREHOUSE SYSTEM</div>
          </div>
        </div>

        <div className="visual-content">
          <div className="eyebrow">
            <span />
            INVENTORY INTELLIGENCE
          </div>

          <h1>
            Know your stock.
            <br />
            <strong>Control your warehouse.</strong>
          </h1>

          <p>
            A centralized platform for inventory, stock movement,
            suppliers and multi-warehouse operations.
          </p>

          <div className="feature-row">
            <div>
              <Package size={19} />
              <span>Inventory Control</span>
            </div>
            <div>
              <ShieldCheck size={19} />
              <span>Transaction Traceability</span>
            </div>
          </div>
        </div>

        <div className="visual-footer">
          WAREHOUSE MANAGEMENT&nbsp;&nbsp;•&nbsp;&nbsp; INVENTORY • OPERATIONS • CONTROL
        </div>
      </section>

      <section className="login-panel">
        <div className="login-box">
          <div className="mobile-brand">
            <div className="brand-mark">
              <Warehouse size={24} />
            </div>
            <span>WarehouseIQ</span>
          </div>

          <div className="login-heading">
            <div className="small-label">SECURE ACCESS</div>
            <h2>Welcome back.</h2>
            <p>Sign in to access your warehouse operations.</p>
          </div>

          <form onSubmit={handleLogin}>
            <label>Username</label>

            <div className="input-wrap">
              <User size={18} />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <label>Password</label>

            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="login-button" type="submit" disabled={loading}>
              <span>{loading ? "AUTHENTICATING..." : "SIGN IN"}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {message && <div className="login-message">{message}</div>}

          <div className="login-note">
            <ShieldCheck size={15} />
            <span>Authorized warehouse personnel only</span>
          </div>
        </div>

        <div className="panel-footer">
          WarehouseIQ <span>•</span> Internal Operations Portal
        </div>
      </section>
    </main>
  );
}

function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const loadLowStockAlerts = () => {
      fetch(`${API}/api/low-stock`, { headers: authHeaders() })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLowStockAlerts(data.alerts || []);
          }
        })
        .catch(() => {});
    };

    loadLowStockAlerts();

    const interval = setInterval(loadLowStockAlerts, 30000);

    return () => clearInterval(interval);
  }, []);

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Products", icon: Package },
    { name: "Inventory", icon: Boxes },
    { name: "Stock In", icon: ArrowDownToLine },
    { name: "Stock Out", icon: ArrowUpFromLine },
    { name: "Movements", icon: BarChart3 },
    { name: "Suppliers", icon: Truck },
    { name: "Warehouses", icon: Building2 },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="side-brand">
          <div className="side-logo">
            <Warehouse size={22} />
          </div>
          <div>
            <strong>WarehouseIQ</strong>
            <small>WAREHOUSE OS</small>
          </div>
        </div>

        <nav className="side-nav">
          <div className="nav-label">OPERATIONS</div>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={
                  activePage === item.name
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() => setActivePage(item.name)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              WAREHOUSEIQ / {activePage.toUpperCase()}
            </div>
            <h1>{activePage}</h1>
          </div>

          <div className="top-actions">
            <div className="notification-wrapper">
              <button
                className={`icon-button ${
                  lowStockAlerts.length > 0 ? "has-notifications" : ""
                }`}
                onClick={() => setShowNotifications((value) => !value)}
                aria-label="Notifications"
              >
                <Bell size={18} />

                {lowStockAlerts.length > 0 && (
                  <span className="notification-count">
                    {lowStockAlerts.length > 99 ? "99+" : lowStockAlerts.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-panel-header">
                    <div>
                      <strong>Notifications</strong>
                      <span>
                        {lowStockAlerts.length} low-stock alert
                        {lowStockAlerts.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="notification-list">
                    {lowStockAlerts.length === 0 ? (
                      <div className="notification-empty">
                        <Bell size={18} />
                        <span>No low-stock alerts.</span>
                      </div>
                    ) : (
                      lowStockAlerts.map((alert) => (
                        <div
                          className="notification-item"
                          key={alert.inventory_id}
                        >
                          <div className="notification-item-icon">
                            <AlertTriangle size={16} />
                          </div>

                          <div className="notification-item-content">
                            <strong>{alert.product_name}</strong>

                            <span>
                              {alert.sku} · {alert.warehouse_name}
                            </span>

                            <small>
                              {alert.available_stock} units remaining ·
                              Minimum {alert.minimum_stock}
                            </small>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-chip">
              <div className="avatar">
                {user.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <strong>{user.full_name}</strong>
                <span>{user.role}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {activePage === "Dashboard" && (
            <DashboardHome user={user} setActivePage={setActivePage} />
          )}

          {activePage === "Products" && <ProductsPage />}

          {activePage === "Inventory" && <InventoryPage />}

          {activePage === "Stock In" && <StockInPage user={user} />}
          {activePage === "Stock Out" && <StockOutPage user={user} />}

          {activePage === "Movements" && <MovementsPage />}

          {activePage === "Suppliers" && <SuppliersPage />}
          {activePage === "Warehouses" && <WarehousesPage />}

          {activePage !== "Dashboard" &&
            activePage !== "Products" &&
            activePage !== "Inventory" &&
            activePage !== "Stock In" &&
            activePage !== "Stock Out" &&
            activePage !== "Movements" &&
            activePage !== "Suppliers" &&
            activePage !== "Warehouses" && (
              <ComingSoonPage activePage={activePage} />
            )}
        </main>
      </section>
    </div>
  );
}

function DashboardHome({ user, setActivePage }) {
  return (
    <>
      <div className="welcome-strip">
        <div>
          <span>OVERVIEW</span>
          <h2>Good to see you, {user.full_name}.</h2>
          <p>
            Monitor warehouse activity and inventory from one place.
          </p>
        </div>

        <Warehouse size={64} strokeWidth={1} />
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<Package />}
          label="TOTAL PRODUCTS"
          value="115"
          note="Products in catalog"
        />

        <StatCard
          icon={<Boxes />}
          label="INVENTORY RECORDS"
          value="133"
          note="Across all warehouses"
        />

        <StatCard
          icon={<Building2 />}
          label="WAREHOUSES"
          value="4"
          note="Active locations"
        />

        <StatCard
          icon={<ArrowUpFromLine />}
          label="STOCK MOVEMENTS"
          value="48"
          note="Recorded transactions"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span>INVENTORY STATUS</span>
              <h3>Warehouse overview</h3>
            </div>
            <Boxes size={20} />
          </div>

          <div className="warehouse-row">
            <div className="warehouse-icon">
              <Building2 size={19} />
            </div>
            <div className="warehouse-info">
              <strong>Warehouse Network</strong>
              <span>4 active warehouse locations</span>
            </div>
            <strong>ACTIVE</strong>
          </div>

          <div className="warehouse-row">
            <div className="warehouse-icon">
              <Package size={19} />
            </div>
            <div className="warehouse-info">
              <strong>Product Catalog</strong>
              <span>115 registered products</span>
            </div>
            <strong>115</strong>
          </div>

          <div className="warehouse-row">
            <div className="warehouse-icon">
              <ArrowDownToLine size={19} />
            </div>
            <div className="warehouse-info">
              <strong>Stock Activity</strong>
              <span>48 recorded movements</span>
            </div>
            <strong>48</strong>
          </div>
        </div>

        <div className="panel quick-panel">
          <div className="panel-header">
            <div>
              <span>QUICK ACCESS</span>
              <h3>Warehouse operations</h3>
            </div>
          </div>

          <button onClick={() => setActivePage("Products")}>
            <Package size={18} />
            <span>View Products</span>
            <ArrowRight size={16} />
          </button>

          <button onClick={() => setActivePage("Inventory")}>
            <Boxes size={18} />
            <span>Check Inventory</span>
            <ArrowRight size={16} />
          </button>

          <button onClick={() => setActivePage("Movements")}>
            <BarChart3 size={18} />
            <span>View Movements</span>
            <ArrowRight size={16} />
          </button>

          <button onClick={() => setActivePage("Suppliers")}>
            <Truck size={18} />
            <span>Manage Suppliers</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const perPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API}/api/products`, { headers: authHeaders() });
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.message || "Failed to load products.");
      }
    } catch {
      setError("Unable to connect to the WarehouseIQ server.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      product.product_name.toLowerCase().includes(searchText) ||
      product.sku.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText) ||
      product.supplier_name.toLowerCase().includes(searchText);

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / perPage)
  );

  const currentPage = Math.min(page, totalPages);

  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const formatPrice = (price) =>
    `₹${Number(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="products-page">
      <div className="module-heading">
        <div>
          <span>PRODUCT CATALOG</span>
          <h2>Products</h2>
          <p>
            Manage and view all products registered in WarehouseIQ.
          </p>
        </div>

        <div className="product-count">
          <strong>{products.length}</strong>
          <span>TOTAL PRODUCTS</span>
        </div>
      </div>

      <div className="product-toolbar">
        <div className="product-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search product, SKU or supplier..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="products-state">
          <Package size={30} />
          <strong>Loading products...</strong>
        </div>
      )}

      {error && (
        <div className="products-state error-state">
          <strong>{error}</strong>
          <button onClick={fetchProducts}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="product-table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>SKU</th>
                  <th>CATEGORY</th>
                  <th>SUPPLIER</th>
                  <th>PRICE</th>
                  <th>MIN STOCK</th>
                </tr>
              </thead>

              <tbody>
                {displayedProducts.map((product) => (
                  <tr key={product.product_id}>
                    <td>
                      <div className="product-name-cell">
                        <div className="product-icon">
                          <Package size={16} />
                        </div>
                        <div>
                          <strong>{product.product_name}</strong>
                          <span>
                            {product.description || "No description"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="sku-badge">{product.sku}</span>
                    </td>

                    <td>{product.category}</td>

                    <td>{product.supplier_name}</td>

                    <td className="price-cell">
                      {formatPrice(product.price)}
                    </td>

                    <td>
                      <span className="stock-badge">
                        {product.minimum_stock}
                      </span>
                    </td>
                  </tr>
                ))}

                {displayedProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-row">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span>
              Showing{" "}
              <strong>
                {filteredProducts.length === 0
                  ? 0
                  : (currentPage - 1) * perPage + 1}
                -
                {Math.min(
                  currentPage * perPage,
                  filteredProducts.length
                )}
              </strong>{" "}
              of <strong>{filteredProducts.length}</strong>
            </span>

            <div className="pagination-buttons">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={16} />
              </button>

              <div className="page-number">
                {currentPage} / {totalPages}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, note }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  );
}


function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const rowsPerPage = 10;

  useEffect(() => {
    fetch(`${API}/api/inventory`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInventory(data.inventory);
        } else {
          setError(data.message || "Failed to load inventory");
        }
      })
      .catch(() => {
        setError("Could not connect to the backend");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const warehouses = [
    "All",
    ...new Set(inventory.map((item) => item.warehouse_name)),
  ];

  const filtered = inventory.filter((item) => {
    const query = search.toLowerCase();

    const matchesSearch =
      item.product_name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      item.bin_location.toLowerCase().includes(query);

    const matchesWarehouse =
      warehouse === "All" ||
      item.warehouse_name === warehouse;

    return matchesSearch && matchesWarehouse;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / rowsPerPage)
  );

  const safePage = Math.min(page, totalPages);

  const startIndex = (safePage - 1) * rowsPerPage;
  const visibleInventory = filtered.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const totalAvailable = inventory.reduce(
    (sum, item) => sum + Number(item.available_stock),
    0
  );

  const totalReserved = inventory.reduce(
    (sum, item) => sum + Number(item.reserved_stock),
    0
  );

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleWarehouse = (value) => {
    setWarehouse(value);
    setPage(1);
  };

  return (
    <div className="module-page inventory-page">

      <div className="module-header">
        <div>
          <div className="eyebrow">
            WAREHOUSEIQ / INVENTORY
          </div>

          <h1>Inventory</h1>

          <p>
            Monitor stock levels across all warehouse locations.
          </p>
        </div>

        <div className="inventory-record-count">
          {filtered.length} RECORDS
        </div>
      </div>

      <div className="inventory-stats">

        <div className="inventory-stat">
          <span>Inventory Records</span>
          <strong>{inventory.length}</strong>
        </div>

        <div className="inventory-stat">
          <span>Available Units</span>
          <strong>
            {totalAvailable.toLocaleString()}
          </strong>
        </div>

        <div className="inventory-stat">
          <span>Reserved Units</span>
          <strong>
            {totalReserved.toLocaleString()}
          </strong>
        </div>

      </div>

      <div className="inventory-toolbar">

        <div className="inventory-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search product, SKU or bin..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <select
          value={warehouse}
          onChange={(e) => handleWarehouse(e.target.value)}
        >
          {warehouses.map((name) => (
            <option key={name} value={name}>
              {name === "All"
                ? "All Warehouses"
                : name}
            </option>
          ))}
        </select>

      </div>

      <div className="inventory-table-card">

        {loading ? (
          <div className="module-state">
            Loading inventory...
          </div>
        ) : error ? (
          <div className="module-state error-state">
            {error}
          </div>
        ) : (
          <>
            <div className="inventory-table-wrap">

              <table className="inventory-table">

                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>WAREHOUSE</th>
                    <th>BIN</th>
                    <th>AVAILABLE</th>
                    <th>RESERVED</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>

                <tbody>

                  {visibleInventory.map((item) => {

                    const available =
                      Number(item.available_stock);

                    const reserved =
                      Number(item.reserved_stock);

                    return (
                      <tr key={item.inventory_id}>

                        <td>
                          <div className="inventory-product">
                            <strong>
                              {item.product_name}
                            </strong>

                            <span>
                              {item.category}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="inventory-sku">
                            {item.sku}
                          </span>
                        </td>

                        <td>
                          {item.warehouse_name}
                        </td>

                        <td>
                          <span className="bin-badge">
                            {item.bin_location}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              available === 0
                                ? "stock-badge stock-zero"
                                : "stock-badge stock-good"
                            }
                          >
                            {available}
                          </span>
                        </td>

                        <td>
                          <span className="reserved-value">
                            {reserved}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {available + reserved}
                          </strong>
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

              {visibleInventory.length === 0 && (
                <div className="module-state">
                  No inventory records found.
                </div>
              )}

            </div>

            <div className="inventory-footer">

              <span>
                Showing{" "}
                {filtered.length === 0
                  ? 0
                  : startIndex + 1}
                {" – "}
                {Math.min(
                  startIndex + rowsPerPage,
                  filtered.length
                )}{" "}
                of {filtered.length}
              </span>

              <div className="inventory-pagination">

                <button
                  onClick={() =>
                    setPage((p) => Math.max(1, p - 1))
                  }
                  disabled={safePage === 1}
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                )
                  .slice(
                    Math.max(0, safePage - 3),
                    Math.min(totalPages, safePage + 2)
                  )
                  .map((pageNumber) => (
                    <button
                      key={pageNumber}
                      className={
                        safePage === pageNumber
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setPage(pageNumber)
                      }
                    >
                      {pageNumber}
                    </button>
                  ))}

                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
                  disabled={safePage === totalPages}
                >
                  Next
                </button>

              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}


function StockInPage({ user }) {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/products`, { headers: authHeaders() }).then((res) => res.json()),
      fetch(`${API}/api/warehouses`, { headers: authHeaders() }).then((res) => res.json()),
    ])
      .then(([productData, warehouseData]) => {
        if (productData.success) {
          setProducts(productData.products);
        }

        if (warehouseData.success) {
          setWarehouses(warehouseData.warehouses);
        }
      })
      .catch(() => {
        setError("Could not load products and warehouses.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!productId || !warehouseId || !quantity || !reference) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API}/api/stock-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          product_id: Number(productId),
          warehouse_id: Number(warehouseId),
          quantity: Number(quantity),
          user_id: user.user_id,
          reference_number: reference,
          reason,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Stock-in failed.");
        return;
      }

      setMessage("Stock successfully added to inventory.");

      setProductId("");
      setWarehouseId("");
      setQuantity("");
      setReference("");
      setReason("");
    } catch {
      setError("Could not connect to the backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="module-page stock-in-page">

      <div className="module-header">
        <div>
          <div className="eyebrow">
            WAREHOUSEIQ / STOCK IN
          </div>

          <h1>Stock In</h1>

          <p>
            Receive incoming stock and update warehouse inventory.
          </p>
        </div>

        <div className="stock-operation-badge">
          INBOUND
        </div>
      </div>

      <div className="stock-form-card">

        <div className="stock-form-heading">
          <div className="stock-form-icon">
            <ArrowDownToLine size={24} />
          </div>

          <div>
            <h2>Record Incoming Stock</h2>
            <p>
              Add received quantities to an existing warehouse
              inventory record.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="module-state">
            Loading products and warehouses...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            <div className="stock-form-grid">

              <div className="form-field">
                <label>
                  PRODUCT <span>*</span>
                </label>

                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.product_id}
                      value={product.product_id}
                    >
                      {product.product_name} — {product.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>
                  WAREHOUSE <span>*</span>
                </label>

                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                >
                  <option value="">
                    Select warehouse
                  </option>

                  {warehouses.map((warehouse) => (
                    <option
                      key={warehouse.warehouse_id}
                      value={warehouse.warehouse_id}
                    >
                      {warehouse.warehouse_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>
                  QUANTITY <span>*</span>
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>
                  REFERENCE NUMBER <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. GRN-2026-001"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div className="form-field full-width">
                <label>REASON / NOTES</label>

                <textarea
                  placeholder="Optional receiving notes..."
                  rows="4"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

            </div>

            {error && (
              <div className="form-message form-error">
                {error}
              </div>
            )}

            {message && (
              <div className="form-message form-success">
                {message}
              </div>
            )}

            <div className="stock-form-actions">
              <button
                type="submit"
                className="primary-form-button"
                disabled={submitting}
              >
                <ArrowDownToLine size={17} />

                {submitting
                  ? "Processing..."
                  : "Record Stock In"}
              </button>
            </div>

          </form>
        )}

      </div>

    </div>
  );
}


function StockOutPage({ user }) {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/products`, { headers: authHeaders() }).then((res) => res.json()),
      fetch(`${API}/api/warehouses`, { headers: authHeaders() }).then((res) => res.json()),
    ])
      .then(([productData, warehouseData]) => {
        if (productData.success) {
          setProducts(productData.products);
        }

        if (warehouseData.success) {
          setWarehouses(warehouseData.warehouses);
        }
      })
      .catch(() => {
        setError("Could not load products and warehouses.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!productId || !warehouseId || !quantity || !reference) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API}/api/stock-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          product_id: Number(productId),
          warehouse_id: Number(warehouseId),
          quantity: Number(quantity),
          user_id: user.user_id,
          reference_number: reference,
          reason,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Stock-out failed.");
        return;
      }

      setMessage("Stock successfully removed from inventory.");

      setProductId("");
      setWarehouseId("");
      setQuantity("");
      setReference("");
      setReason("");
    } catch {
      setError("Could not connect to the backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="module-page stock-in-page">

      <div className="module-header">
        <div>
          <div className="eyebrow">
            WAREHOUSEIQ / STOCK OUT
          </div>

          <h1>Stock Out</h1>

          <p>
            Record outgoing stock and update warehouse inventory.
          </p>
        </div>

        <div className="stock-operation-badge stock-out-badge">
          OUTBOUND
        </div>
      </div>

      <div className="stock-form-card">

        <div className="stock-form-heading">
          <div className="stock-form-icon stock-out-icon">
            <ArrowUpFromLine size={24} />
          </div>

          <div>
            <h2>Record Outgoing Stock</h2>
            <p>
              Remove available quantities from a warehouse inventory record.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="module-state">
            Loading products and warehouses...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            <div className="stock-form-grid">

              <div className="form-field">
                <label>
                  PRODUCT <span>*</span>
                </label>

                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.product_id}
                      value={product.product_id}
                    >
                      {product.product_name} — {product.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>
                  WAREHOUSE <span>*</span>
                </label>

                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                >
                  <option value="">
                    Select warehouse
                  </option>

                  {warehouses.map((warehouse) => (
                    <option
                      key={warehouse.warehouse_id}
                      value={warehouse.warehouse_id}
                    >
                      {warehouse.warehouse_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>
                  QUANTITY <span>*</span>
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>
                  REFERENCE NUMBER <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. SO-2026-001"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div className="form-field full-width">
                <label>REASON / NOTES</label>

                <textarea
                  placeholder="Optional dispatch or issue notes..."
                  rows="4"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

            </div>

            {error && (
              <div className="form-message form-error">
                {error}
              </div>
            )}

            {message && (
              <div className="form-message form-success">
                {message}
              </div>
            )}

            <div className="stock-form-actions">
              <button
                type="submit"
                className="primary-form-button stock-out-button"
                disabled={submitting}
              >
                <ArrowUpFromLine size={17} />

                {submitting
                  ? "Processing..."
                  : "Record Stock Out"}
              </button>
            </div>

          </form>
        )}

      </div>

    </div>
  );
}


function MovementsPage() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  useEffect(() => {
    fetch(`${API}/api/movements`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.message || "Could not load movements.");
          return;
        }

        setMovements(data.movements || []);
      })
      .catch(() => {
        setError("Could not connect to the backend.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(movements.length / rowsPerPage)
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleMovements = movements.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const startRecord =
    movements.length === 0 ? 0 : startIndex + 1;

  const endRecord = Math.min(
    startIndex + rowsPerPage,
    movements.length
  );

  return (
    <div className="module-page movements-page">

      <div className="module-header">
        <div>
          <div className="eyebrow">
            WAREHOUSEIQ / MOVEMENTS
          </div>

          <h1>Stock Movements</h1>

          <p>
            View the complete history of inventory transactions.
          </p>
        </div>

        <div className="stock-operation-badge">
          {movements.length} RECORDS
        </div>
      </div>

      <div className="movements-table-card">

        {loading ? (
          <div className="module-state">
            Loading stock movements...
          </div>
        ) : error ? (
          <div className="module-state form-error">
            {error}
          </div>
        ) : movements.length === 0 ? (
          <div className="module-state">
            No stock movements found.
          </div>
        ) : (
          <>
            <div className="movements-table-wrap">
              <table className="movements-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>DATE</th>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>WAREHOUSE</th>
                    <th>TYPE</th>
                    <th>QTY</th>
                    <th>REFERENCE</th>
                    <th>USER</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleMovements.map((movement) => (
                    <tr key={movement.movement_id}>
                      <td>{movement.movement_id}</td>

                      <td>
                        {new Date(
                          movement.movement_date
                        ).toLocaleString()}
                      </td>

                      <td>
                        <strong>{movement.product_name}</strong>
                      </td>

                      <td>{movement.sku}</td>

                      <td>{movement.warehouse_name}</td>

                      <td>
                        <span
                          className={`movement-type ${
                            movement.movement_type === "IN"
                              ? "movement-in"
                              : "movement-out"
                          }`}
                        >
                          {movement.movement_type}
                        </span>
                      </td>

                      <td>{movement.quantity}</td>

                      <td>{movement.reference_number}</td>

                      <td>{movement.full_name}</td>

                      <td>
                        <span className="movement-status">
                          {movement.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="movements-footer">
              <div className="movements-range">
                Showing {startRecord}–{endRecord} of{" "}
                {movements.length} movements
              </div>

              <div className="movements-pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                >
                  ← Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={
                      currentPage === page
                        ? "active"
                        : ""
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
}


function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 6;

  useEffect(() => {
    fetch(`${API}/api/suppliers`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.message || "Could not load suppliers.");
          return;
        }

        setSuppliers(data.suppliers || []);
      })
      .catch(() => {
        setError("Could not connect to the backend.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredSuppliers = suppliers.filter((supplier) => {
    const query = search.toLowerCase();

    return (
      supplier.supplier_name?.toLowerCase().includes(query) ||
      supplier.contact_person?.toLowerCase().includes(query) ||
      supplier.email?.toLowerCase().includes(query) ||
      supplier.phone?.includes(query) ||
      supplier.address?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSuppliers.length / rowsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * rowsPerPage;

  const visibleSuppliers = filteredSuppliers.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const startRecord =
    filteredSuppliers.length === 0 ? 0 : startIndex + 1;

  const endRecord = Math.min(
    startIndex + rowsPerPage,
    filteredSuppliers.length
  );

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <div className="module-page suppliers-page">

      <div className="module-header">
        <div>
          <div className="eyebrow">
            WAREHOUSEIQ / SUPPLIERS
          </div>

          <h1>Suppliers</h1>

          <p>
            Manage supplier information and procurement details.
          </p>
        </div>

        <div className="stock-operation-badge">
          {suppliers.length} SUPPLIERS
        </div>
      </div>

      <div className="suppliers-toolbar">
        <div className="suppliers-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search suppliers, contacts, email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="suppliers-table-card">

        {loading ? (
          <div className="module-state">
            Loading suppliers...
          </div>
        ) : error ? (
          <div className="module-state form-error">
            {error}
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="module-state">
            No suppliers found.
          </div>
        ) : (
          <>
            <div className="suppliers-table-wrap">
              <table className="suppliers-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>SUPPLIER</th>
                    <th>CONTACT PERSON</th>
                    <th>PHONE</th>
                    <th>EMAIL</th>
                    <th>LOCATION</th>
                    <th>LEAD TIME</th>
                    <th>PRODUCTS</th>
                    <th>LAST CONTACT</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleSuppliers.map((supplier) => (
                    <tr key={supplier.supplier_id}>
                      <td>{supplier.supplier_id}</td>

                      <td>
                        <div className="supplier-name">
                          {supplier.supplier_name}
                        </div>
                      </td>

                      <td>{supplier.contact_person}</td>

                      <td>{supplier.phone}</td>

                      <td>{supplier.email}</td>

                      <td>{supplier.address || "—"}</td>

                      <td>
                        <span className="supplier-lead-time">
                          {supplier.lead_time_days} days
                        </span>
                      </td>

                      <td>
                        <span className="supplier-product-count">
                          {supplier.product_count}
                        </span>
                      </td>

                      <td>
                        {supplier.last_contact_date
                          ? new Date(
                              supplier.last_contact_date
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="suppliers-footer">
              <div className="suppliers-range">
                Showing {startRecord}–{endRecord} of{" "}
                {filteredSuppliers.length} suppliers
              </div>

              <div className="suppliers-pagination">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                >
                  ← Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={
                      safePage === page ? "active" : ""
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
}


function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 4;

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/warehouses`, { headers: authHeaders() }).then((res) => res.json()),
      fetch(`${API}/api/warehouse-values`, { headers: authHeaders() }).then((res) => res.json())
    ])
      .then(([warehouseData, valueData]) => {
        if (!warehouseData.success) {
          throw new Error(
            warehouseData.error || "Failed to load warehouses"
          );
        }

        if (!valueData.success) {
          throw new Error(
            valueData.error || "Failed to load warehouse values"
          );
        }

        const valueMap = new Map(
          (valueData.warehouse_values || []).map((warehouse) => [
            warehouse.warehouse_id,
            warehouse
          ])
        );

        const merged = (warehouseData.warehouses || []).map((warehouse) => ({
          ...warehouse,
          inventory_value:
            valueMap.get(warehouse.warehouse_id)?.total_value || 0,
          total_stock:
            valueMap.get(warehouse.warehouse_id)?.total_stock || 0,
          product_count:
            valueMap.get(warehouse.warehouse_id)?.product_count || 0
        }));

        setWarehouses(merged);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const query = search.toLowerCase();

    return (
      String(warehouse.warehouse_id).includes(query) ||
      (warehouse.warehouse_name || "").toLowerCase().includes(query) ||
      (warehouse.location || "").toLowerCase().includes(query) ||
      (warehouse.bin_code || "").toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWarehouses.length / rowsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;
  const visibleWarehouses = filteredWarehouses.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="module-page warehouses-page">
      <div className="module-header">
        <div>
          <div className="eyebrow">WAREHOUSEIQ / WAREHOUSES</div>
          <h1>Warehouses</h1>
          <p>Manage warehouse locations, bins, and storage capacity.</p>
        </div>

        <div className="module-count-badge">
          {warehouses.length} WAREHOUSES
        </div>
      </div>

      <div className="warehouses-toolbar">
        <div className="warehouses-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search warehouse, location or bin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="loading-state">Loading warehouses...</div>
      )}

      {error && (
        <div className="error-state">{error}</div>
      )}

      {!loading && !error && (
        <div className="warehouses-table-card">
          <div className="warehouses-table-wrap">
            <table className="warehouses-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>WAREHOUSE</th>
                  <th>LOCATION</th>
                  <th>BIN CODE</th>
                  <th>CAPACITY</th>
                  <th>INVENTORY VALUE</th>
                </tr>
              </thead>

              <tbody>
                {visibleWarehouses.map((warehouse) => (
                  <tr key={warehouse.warehouse_id}>
                    <td>#{warehouse.warehouse_id}</td>

                    <td>
                      <span className="warehouse-name">
                        {warehouse.warehouse_name}
                      </span>
                    </td>

                    <td>{warehouse.location}</td>

                    <td>
                      <span className="warehouse-bin">
                        {warehouse.bin_code}
                      </span>
                    </td>

                    <td>
                      <span className="warehouse-capacity">
                        {warehouse.capacity.toLocaleString()} units
                      </span>
                    </td>

                    <td>
                      <span className="warehouse-value">
                        ₹{Number(warehouse.inventory_value || 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                  </tr>
                ))}

                {visibleWarehouses.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      No warehouses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="warehouses-footer">
            <div className="warehouses-range">
              {filteredWarehouses.length === 0
                ? "0 warehouses"
                : `Showing ${startIndex + 1}-${Math.min(
                    startIndex + rowsPerPage,
                    filteredWarehouses.length
                  )} of ${filteredWarehouses.length}`}
            </div>

            <div className="warehouses-pagination">
              <button
                disabled={safePage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={safePage === page ? "active" : ""}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ComingSoonPage({ activePage }) {
  const icons = {
    Inventory: Boxes,
    "Stock In": ArrowDownToLine,
    "Stock Out": ArrowUpFromLine,
    Movements: BarChart3,
    Suppliers: Truck,
    Warehouses: Building2,
  };

  const Icon = icons[activePage] || Package;

  return (
    <div className="coming-panel">
      <div className="coming-icon">
        <Icon size={34} />
      </div>

      <span>MODULE</span>
      <h2>{activePage}</h2>
      <p>
        This module is ready for database integration. We will build
        this section next.
      </p>
    </div>
  );
}

function App() {
  const savedUser = sessionStorage.getItem("warehouseiq_user");

  const [user, setUser] = useState(
    savedUser ? JSON.parse(savedUser) : null
  );

  useEffect(() => {
    if (!user) return;

    const preventBackToLogin = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventBackToLogin);

    return () => {
      window.removeEventListener("popstate", preventBackToLogin);
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("warehouseiq_user");
    window.history.replaceState(null, "", window.location.href);
    setUser(null);
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return <Login onLogin={setUser} />;
}

export default App;

