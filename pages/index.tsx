import Head from 'next/head';
import { GetStaticProps } from 'next';
import { db } from '../lib/db-nextjs';
import { menuItems } from '../lib/schema';
import type { MenuItem } from '../lib/schema';

interface HomeProps {
  featuredItems: MenuItem[];
}

export default function Home({ featuredItems }: HomeProps) {
  return (
    <>
      <Head>
        <title>Las Tortillas Mexican Grill - Restaurante Mexicano em Luanda</title>
        <meta name="description" content="O único restaurante mexicano com ambiente 100% familiar em Luanda. Sabores autênticos do México desde 2018." />
        <meta property="og:title" content="Las Tortillas Mexican Grill" />
        <meta property="og:description" content="O único restaurante mexicano com ambiente 100% familiar em Luanda. Sabores autênticos do México desde 2018." />
        <meta property="og:type" content="website" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-mexican-red-50 to-mexican-green-50">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center text-center px-4">
          <div className="bg-gradient-mexican absolute inset-0 opacity-10"></div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Las Tortillas
              <span className="block text-3xl md:text-5xl text-mexican-red-600 mt-2">
                Mexican Grill
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
              O único restaurante mexicano com ambiente 100% familiar em Luanda
            </p>
            <div className="space-y-4 md:space-y-0 md:space-x-6 md:flex md:justify-center">
              <button className="w-full md:w-auto bg-mexican-red-600 hover:bg-mexican-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                Ver Menu
              </button>
              <button className="w-full md:w-auto bg-mexican-green-600 hover:bg-mexican-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                Fazer Reserva
              </button>
            </div>
          </div>
        </section>

        {/* Featured Menu Items */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Pratos em Destaque
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-mexican-red-600">
                        {parseFloat(item.price).toLocaleString('pt-AO', {
                          style: 'currency',
                          currency: 'AOA',
                        })}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.preparationTime} min
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl font-bold mb-8">Visite-nos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Talatona</h3>
                <p className="text-gray-300">
                  Rua Principal, Talatona<br />
                  Luanda, Angola
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Centro</h3>
                <p className="text-gray-300">
                  Rua do Centro, Baixa<br />
                  Luanda, Angola
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Food Truck</h3>
                <p className="text-gray-300">
                  Localização variável<br />
                  Siga-nos nas redes sociais
                </p>
              </div>
            </div>
            <div className="mt-12">
              <a 
                href="https://wa.me/244949639932" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                <span className="mr-2">📱</span>
                WhatsApp: +244 949 639 932
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Get featured menu items (limit to 6 for homepage)
    const featuredItems = await db.select().from(menuItems).limit(6);
    
    return {
      props: {
        featuredItems,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching featured items:', error);
    
    // Return empty array if database is not available
    return {
      props: {
        featuredItems: [],
      },
      revalidate: 60, // Try again in 1 minute
    };
  }
};