import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardMedia,
  Box,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";
import useInventoryStore from "../../stores/useInventoryStore";
import { formatCurrency } from "../../utils/formatters";
import useCartStore from "../../stores/useCartStore";
import useSettingsStore from "../../stores/useSettingsStore";

const ProductGrid = ({ onProductSelect, disabled }) => {
  const { products, searchProducts } = useInventoryStore();
  const cartItems = useCartStore((state) => state.items);
  const { posSettings } = useSettingsStore();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredProducts, setFilteredProducts] = React.useState(products);
  const searchInputRef = React.useRef(null);

  React.useEffect(() => {
    // Focus search input on mount for quick keyboard access
    searchInputRef.current?.focus();
  }, []);

  React.useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(searchProducts(searchTerm));
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products, searchProducts]);

  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find((item) => item.id === productId);
    return cartItem?.quantity || 0;
  };

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Esc to clear search
      if (e.key === "Escape") {
        setSearchTerm("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <TextField
          fullWidth
          inputRef={searchInputRef}
          variant="outlined"
          placeholder="Search products (Ctrl+F)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm("")}>
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: "background.paper" }}
        />
      </Box>

      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
        <Grid container spacing={2}>
          {filteredProducts.map((product) => {
            const cartQuantity = getCartQuantity(product.id);
            const remainingStock = product.stock - cartQuantity;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  onClick={() =>
                    !disabled && remainingStock > 0 && onProductSelect(product)
                  }
                  sx={{
                    cursor:
                      disabled || remainingStock <= 0
                        ? "not-allowed"
                        : "pointer",
                    opacity: disabled || remainingStock <= 0 ? 0.6 : 1,
                    height: "100%",
                    position: "relative",
                    transition: "transform 0.2s ease-in-out",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={`${remainingStock} left`}
                      color={remainingStock > 0 ? "success" : "error"}
                      size="small"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor:
                          remainingStock > 0
                            ? "rgba(46, 125, 50, 0.9)"
                            : "rgba(211, 47, 47, 0.9)",
                        color: "#fff",
                      }}
                    />
                    {cartQuantity > 0 && (
                      <Chip
                        label={`${cartQuantity} in cart`}
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "rgba(25, 118, 210, 0.9)",
                          color: "#fff",
                        }}
                      />
                    )}
                  </Box>

                  <Box
                    sx={{
                      height: 200,
                      backgroundColor: "grey.50",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {product.image ? (
                      <CardMedia
                        component="img"
                        image={product.image}
                        alt={product.name}
                        sx={{
                          height: "80%",
                          width: "auto",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: "80%",
                          height: "80%",
                          backgroundColor: "grey.100",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 1,
                        }}
                      >
                        <Typography color="text.secondary">No Image</Typography>
                      </Box>
                    )}
                  </Box>

                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        mb: 1,
                        height: "2.4em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{
                        color: "primary.main",
                        fontWeight: 700,
                        fontSize: "1.5rem",
                      }}
                    >
                      {formatCurrency(product.price)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default ProductGrid;
