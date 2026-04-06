import { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  TextField,
  IconButton,
} from "@material-ui/core";
import CreditCardIcon from "@material-ui/icons/CreditCard";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    width: "100%",
    maxWidth: "none",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "8px",
    margin: "12px 0",
    padding: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  icon: {
    marginRight: "20px",
    fontSize: "28px",
    color: theme.palette.primary.main,
  },
  primaryText: {
    fontWeight: "bold",
    color: theme.palette.text.primary,
  },
  activeText: {
    color: theme.palette.success.main,
  },
  inactiveText: {
    color: theme.palette.error.main,
  },
  button: {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary,
    padding: "6px 12px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.action.selected,
    },
  },
  addMethodForm: {
    display: "flex",
    marginBottom: "20px",
  },
  addMethodInput: {
    flexGrow: 1,
    marginRight: "10px",
    backgroundColor: "white",
  },
  deleteButton: {
    color: theme.palette.error.main,
  },
}));

export const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods($parentId: Long!) {
    paymentMethods(parentId: $parentId) {
      id
      method
      isActive
      createdAt
    }
  }
`;

export const SET_ACTIVE_PAYMENT_METHOD = gql`
  mutation SetActivePaymentMethod($parentId: Long!, $methodId: Long!) {
    setActivePaymentMethod(parentId: $parentId, methodId: $methodId) {
      id
      method
      isActive
    }
  }
`;

const ADD_PAYMENT_METHOD = gql`
  mutation AddPaymentMethod($parentId: Long!, $method: String!) {
    addPaymentMethod(parentId: $parentId, method: $method) {
      id
      method
      isActive
    }
  }
`;

const DELETE_PAYMENT_METHOD = gql`
  mutation DeletePaymentMethod($parentId: Long!, $methodId: Long!) {
    deletePaymentMethod(parentId: $parentId, methodId: $methodId)
  }
`;

const updatePaymentMethodsCache = (
  cache: any,
  parentId: number,
  updater: (methods: any[]) => any[]
) => {
  const existing: any = cache.readQuery({
    query: GET_PAYMENT_METHODS,
    variables: { parentId },
  });

  if (!existing) return;

  cache.writeQuery({
    query: GET_PAYMENT_METHODS,
    variables: { parentId },
    data: {
      paymentMethods: updater(existing.paymentMethods),
    },
  });
};

const PaymentMethods = ({ parentId }: { parentId: number }) => {
  const classes = useStyles();
  const [newMethod, setNewMethod] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { loading, data } = useQuery(GET_PAYMENT_METHODS, {
    variables: { parentId },
  });
  const [setActivePaymentMethod] = useMutation(SET_ACTIVE_PAYMENT_METHOD, {
    update(cache, { data }) {
      if (!data?.setActivePaymentMethod) return;

      updatePaymentMethodsCache(cache, parentId, (methods) =>
        methods.map((m) => ({
          ...m,
          isActive: m.id === data.setActivePaymentMethod.id,
        }))
      );
    }
  });

  const [addPaymentMethod] = useMutation(ADD_PAYMENT_METHOD, {
    update(cache, { data }) {
      if (!data?.addPaymentMethod) return;

      updatePaymentMethodsCache(cache, parentId, (methods) => [
        ...methods,
        data.addPaymentMethod,
      ]);
    }
  });

  const [deletePaymentMethod] = useMutation(DELETE_PAYMENT_METHOD, {
    update(cache, _, { variables }) {
      updatePaymentMethodsCache(cache, parentId, (methods) =>
        methods.filter((m) => m.id !== variables?.methodId)
      );
    }
  });

  if (loading) return <p>Loading...</p>;

  const handleActivate = (methodId: number) => {
    setActivePaymentMethod({
      variables: { parentId, methodId },
    });
  };

  const handleAddMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMethod.trim()) {
      addPaymentMethod({
        variables: { parentId, method: newMethod.trim() },
      }).then(() => {
        setNewMethod("");
        setError(null);
      });
    }
  };

  const handleDeleteMethod = (methodId: number) => {
    deletePaymentMethod({
      variables: { parentId, methodId },
    }).catch((err) => {
      setError(err.message || "Failed to delete payment method");
    });
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div>
          <Typography variant="h5">Payment Methods</Typography>
          <Typography variant="subtitle1" style={{ color: grey[700] }}>
            Manage and select your preferred payment options
          </Typography>
        </div>
      </div>
      {error && (
        <Typography style={{ color: "red", marginBottom: "16px" }}>
          {error}
        </Typography>
      )}
      <form onSubmit={handleAddMethod} className={classes.addMethodForm}>
        <TextField
          className={classes.addMethodInput}
          value={newMethod}
          onChange={(e) => setNewMethod(e.target.value)}
          placeholder="Add new payment method"
          variant="outlined"
          size="small"
        />
        <Button
          type="submit"
          variant="contained"
          className={classes.button}
          size="small"
        >
          Add Method
        </Button>
      </form>
      <List>
        {data?.paymentMethods.map((method: any) => (
          <ListItem key={method.id} className={classes.listItem}>
            <ListItemIcon>
              <CreditCardIcon />
            </ListItemIcon>
            <ListItemText
              primary={method.method}
              secondary={
                <Typography variant="caption" style={{ color: "gray" }}>
                  Created {new Date(method.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                </Typography>
              }
              primaryTypographyProps={{ className: classes.primaryText }}
            />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "16px" }}>
              {!method.isActive && (
                <Button
                  variant="contained"
                  className={classes.button}
                  onClick={() => handleActivate(method.id)}
                  size="small"
                >
                  Activate
                </Button>
              )}
              <Typography variant="body2" style={{ marginTop: "8px", color: method.isActive ? "green" : "red" }}>
                {method.isActive ? "Active" : "Inactive"}
              </Typography>
            </div>
            <IconButton
              className={classes.deleteButton}
              onClick={() => handleDeleteMethod(method.id)}
              size="small"
              disabled={method.isActive}
              title={method.isActive ? "Cannot delete an active payment method" : ""}
            >
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default PaymentMethods;
