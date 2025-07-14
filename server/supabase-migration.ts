import { supabase } from './supabase-client';
import { prisma } from './db';

/**
 * Migration utility to sync data between local database and Supabase
 * This will be useful when Supabase direct connection is available
 */

export async function migrateMenuItemsToSupabase() {
  try {
    console.log('Migrating menu items to Supabase...');
    
    // Get all menu items from local database
    const localMenuItems = await prisma.menuItem.findMany();
    
    // Clear existing data in Supabase (optional)
    await supabase.from('menu_items').delete().neq('id', 0);
    
    // Insert data into Supabase
    const { data, error } = await supabase
      .from('menu_items')
      .insert(localMenuItems.map(item => ({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        available: item.available,
        preparation_time: item.preparationTime,
        customizations: item.customizations
      })));
    
    if (error) {
      console.error('Error migrating menu items:', error);
      return false;
    }
    
    console.log('✓ Menu items migrated successfully');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

export async function migrateOrdersToSupabase() {
  try {
    console.log('Migrating orders to Supabase...');
    
    const localOrders = await prisma.order.findMany({
      include: {
        orderItems: true
      }
    });
    
    for (const order of localOrders) {
      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          customer_email: order.customerEmail,
          location_id: order.locationId,
          table_id: order.tableId,
          order_type: order.orderType,
          status: order.status,
          total_amount: order.totalAmount,
          delivery_fee: order.deliveryFee
        })
        .select();
      
      if (orderError) {
        console.error('Error migrating order:', orderError);
        continue;
      }
      
      // Insert order items
      if (orderData?.[0]) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(order.orderItems.map(item => ({
            order_id: orderData[0].id,
            menu_item_id: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations
          })));
        
        if (itemsError) {
          console.error('Error migrating order items:', itemsError);
        }
      }
    }
    
    console.log('✓ Orders migrated successfully');
    return true;
  } catch (error) {
    console.error('Order migration failed:', error);
    return false;
  }
}

export async function fullMigrationToSupabase() {
  console.log('Starting full migration to Supabase...');
  
  const menuSuccess = await migrateMenuItemsToSupabase();
  const orderSuccess = await migrateOrdersToSupabase();
  
  if (menuSuccess && orderSuccess) {
    console.log('✓ Full migration completed successfully');
    return true;
  } else {
    console.log('✗ Migration completed with errors');
    return false;
  }
}