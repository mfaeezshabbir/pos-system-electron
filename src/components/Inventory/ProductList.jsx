import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  CardActions,
  Button,
  Stack,
  Paper,
} from "@mui/material";
import {
  Search,
  Edit,
  Delete,
  Warning,
  ShoppingCart,
  Clear,
} from "@mui/icons-material";
import { formatCurrency } from "../../utils/formatters";
import useSettingsStore from "../../stores/useSettingsStore";
import useCartStore from "../../stores/useCartStore";
import useAuthStore, { ROLES } from "../../stores/useAuthStore";
import { DEFAULT_PRODUCT_IMAGE } from "../../utils/constants";

const ProductList = ({ products, onEdit, onDelete, userRole }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const lowStockThreshold = useSettingsStore(
    (state) => state.posSettings.lowStockThreshold
  );
  const addToCart = useCartStore((state) => state.addItem);
  const { currentUser } = useAuthStore();

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEditProducts =
    userRole === ROLES.ADMIN || userRole === ROLES.MANAGER;

  return (
    <Stack spacing={3}>
      {/* Search Bar */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, SKU or category..."
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
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />
      </Paper>

      {/* Product Grid */}
      <Grid container spacing={2}>
        {filteredProducts.map((product) => {
          const isLowStock = product.stock <= lowStockThreshold;
          const isOutOfStock = product.stock === 0;

          return (
            <Grid item xs={12} sm={6} md={3} lg={2} key={product.id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  transition: "all 0.2s ease-in-out",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="120"
                    image={product.image || DEFAULT_PRODUCT_IMAGE}
                    alt={product.name}
                    sx={{
                      objectFit: "contain",
                      bgcolor: (theme) =>
                        theme.palette.mode === "light" ? "grey.50" : "grey.900",
                      p: 2,
                    }}
                  />
                  {(isLowStock || isOutOfStock) && (
                    <Chip
                      label={isOutOfStock ? "Out" : "Low"}
                      color={isOutOfStock ? "error" : "warning"}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 20,
                      }}
                    />
                  )}
                </Box>

                <CardContent sx={{ p: 1.5, flexGrow: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      height: "2.4em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      fontSize: "0.875rem",
                    }}
                  >
                    {product.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="primary.main"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    {formatCurrency(product.price)}
                  </Typography>

                  <Typography
                    variant="caption"
                    color={isLowStock ? "warning.main" : "success.main"}
                    sx={{
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: isLowStock ? "warning.main" : "success.main",
                      }}
                    />
                    {product.stock} in stock
                  </Typography>
                </CardContent>

                <CardActions
                  sx={{ p: 1, borderTop: "1px solid", borderColor: "divider" }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                    spacing={1}
                  >
                    {canEditProducts && (
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => onEdit(product)}
                          sx={{ p: 0.5 }}
                          color="success"
                        >
                          <Edit sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onDelete(product)}
                          sx={{ p: 0.5 }}
                          color="error"
                        >
                          <Delete sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Stack>
                    )}
                    <Box sx={{ flexGrow: canEditProducts ? 0 : 1 }} />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      sx={{
                        minWidth: 0,
                        p: 1,
                      }}
                    >
                      <ShoppingCart sx={{ fontSize: 16 }} />
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
};

export default ProductList;
