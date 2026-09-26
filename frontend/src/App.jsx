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
        localStorage.setItem("warehouseiq_user", JSON.stringify(data.user));
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
            <button className="icon-button">
              <Bell size={18} />
            </button>

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

          {activePage !== "Dashboard" &&
            activePage !== "Products" &&
            activePage !== "Inventory" &&
            activePage !== "Stock In" && (
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

      const response = await fetch(`${API}/api/products`);
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
    fetch(`${API}/api/inventory`)
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
      fetch(`${API}/api/products`).then((res) => res.json()),
      fetch(`${API}/api/warehouses`).then((res) => res.json()),
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
  const savedUser = localStorage.getItem("warehouseiq_user");

  const [user, setUser] = useState(
    savedUser ? JSON.parse(savedUser) : null
  );

  const handleLogout = () => {
    localStorage.removeItem("warehouseiq_user");
    setUser(null);
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return <Login onLogin={setUser} />;
}

export default App;

