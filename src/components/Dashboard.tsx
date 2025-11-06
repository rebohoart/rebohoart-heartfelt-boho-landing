import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Sparkles, TrendingUp, Package } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  items: Array<{
    product_id: string;
    product_title: string;
    product_price: number;
    quantity: number;
    subtotal: number;
  }>;
  created_at: string;
}

interface CustomOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  title: string;
  description: string;
  delivery_deadline: string;
  images: string[] | null;
  created_at: string;
}

const Dashboard = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  // Fetch custom orders
  const { data: customOrders = [], isLoading: customOrdersLoading } = useQuery({
    queryKey: ['dashboard-custom-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CustomOrder[];
    },
  });

  // Filter data by date
  const filteredOrders = useMemo(() => {
    if (!startDate && !endDate) return orders;

    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && orderDate < start) return false;
      if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        if (orderDate > endOfDay) return false;
      }

      return true;
    });
  }, [orders, startDate, endDate]);

  const filteredCustomOrders = useMemo(() => {
    if (!startDate && !endDate) return customOrders;

    return customOrders.filter(order => {
      const orderDate = new Date(order.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && orderDate < start) return false;
      if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        if (orderDate > endOfDay) return false;
      }

      return true;
    });
  }, [customOrders, startDate, endDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalCustomOrders = filteredCustomOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

    // Product statistics
    const productStats: Record<string, { quantity: number; revenue: number; title: string }> = {};

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productStats[item.product_id]) {
          productStats[item.product_id] = {
            quantity: 0,
            revenue: 0,
            title: item.product_title
          };
        }
        productStats[item.product_id].quantity += item.quantity;
        productStats[item.product_id].revenue += item.subtotal;
      });
    });

    // Sort products by quantity
    const productStatsArray = Object.entries(productStats)
      .map(([productId, stats]) => ({
        productId,
        ...stats
      }))
      .sort((a, b) => b.quantity - a.quantity);

    return {
      totalOrders,
      totalCustomOrders,
      totalRevenue,
      productStats: productStatsArray
    };
  }, [filteredOrders, filteredCustomOrders]);

  const isLoading = ordersLoading || customOrdersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">A carregar estatísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <Card className="p-6">
        <h3 className="font-serif text-xl font-bold mb-4">Filtrar por Data</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-date">Data Início</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end-date">Data Fim</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Encomendas</p>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-full">
              <Sparkles className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pedidos de Orçamento</p>
              <p className="text-3xl font-bold">{stats.totalCustomOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-3xl font-bold">€{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Product Statistics */}
      <Card className="p-6">
        <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Estatísticas por Produto
        </h3>

        {stats.productStats.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum produto vendido no período selecionado
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Produto</th>
                  <th className="text-center py-3 px-4 font-semibold">Quantidade Vendida</th>
                  <th className="text-right py-3 px-4 font-semibold">Receita Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.productStats.map((product, index) => (
                  <tr key={product.productId} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                    <td className="py-3 px-4">{product.title}</td>
                    <td className="py-3 px-4 text-center font-semibold">{product.quantity}</td>
                    <td className="py-3 px-4 text-right font-semibold text-primary">
                      €{product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4 text-center">
                    {stats.productStats.reduce((sum, p) => sum + p.quantity, 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-primary">
                    €{stats.totalRevenue.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Recent Orders */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Regular Orders */}
        <Card className="p-6">
          <h3 className="font-serif text-xl font-bold mb-4">Encomendas Recentes</h3>
          {filteredOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma encomenda encontrada
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredOrders.slice(0, 10).map((order) => (
                <div key={order.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    </div>
                    <p className="font-bold text-primary">€{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('pt-PT', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <div className="mt-2 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-muted-foreground">
                        {item.quantity}x {item.product_title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Custom Orders */}
        <Card className="p-6">
          <h3 className="font-serif text-xl font-bold mb-4">Orçamentos Recentes</h3>
          {filteredCustomOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum orçamento encontrado
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredCustomOrders.slice(0, 10).map((order) => (
                <div key={order.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="mb-2">
                    <p className="font-semibold">{order.title}</p>
                    <p className="text-sm">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Pedido em: {new Date(order.created_at).toLocaleDateString('pt-PT', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Entrega: {new Date(order.delivery_deadline).toLocaleDateString('pt-PT', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
