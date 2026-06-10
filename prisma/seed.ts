import bcrypt from 'bcryptjs';

import prisma from '../src/config/prisma.js';

async function main() {
	await prisma.book.deleteMany();
	await prisma.category.deleteMany();
	await prisma.user.deleteMany();

	const [
		fashionDesign,
		classicCars,
		transportation,
		designHistoryAndCriticism,
		automotive,
		lifestyle,
		decorating
	] = await Promise.all([
		prisma.category.create({ data: { name: 'Fashion Design' } }),
		prisma.category.create({ data: { name: 'Classic Cars' } }),
		prisma.category.create({ data: { name: 'Transportation' } }),
		prisma.category.create({
			data: { name: 'Design History & Criticism' }
		}),
		prisma.category.create({ data: { name: 'Automotive' } }),
		prisma.category.create({ data: { name: 'Lifestyle' } }),
		prisma.category.create({ data: { name: 'Decorating' } })
	]);

	const adminEmail = process.env.ADMIN_EMAIL || 'admin@bookhaven.com';
	const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
	const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
	const hashedUserPassword = await bcrypt.hash('user123', 10);

	await prisma.user.create({
		data: {
			name: 'Admin User',
			email: adminEmail,
			password: hashedAdminPassword,
			role: 'ADMIN'
		}
	});

	await prisma.user.create({
		data: {
			name: 'Demo User',
			email: 'user@bookhaven.com',
			password: hashedUserPassword,
			role: 'USER'
		}
	});

	await prisma.book.createMany({
		data: [
			{
				title: 'The Little Book of Chanel',
				author: 'Emma Baxter-Wright, Welbeck',
				description:
					'Little Book of Chanel is the pocket-sized and beautifully illustrated story of the most celebrated fashion designer in history.',
				price: 6.51,
				isbn: '',
				stock: 10,
				coverImage:
					'https://m.media-amazon.com/images/I/51XjkprYJzL._SL1500_.jpg',
				categoryId: fashionDesign.id
			},
			{
				title: 'The Story of Ferrari: A Tribute to Automotive Excellence (The Story of Cars)',
				author: 'Stuart Codling',
				description:
					'The Story of Ferrari is a pocket-sized and exceptionally designed celebration of the legendary manufacturer.',
				price: 13.44,
				isbn: '',
				stock: 10,
				coverImage:
					'https://m.media-amazon.com/images/I/51goAs+-R5L._SL1500_.jpg',
				categoryId: classicCars.id
			},
			{
				title: 'The Story of Porsche: A Tribute to the Legendary Manufacturer (The Story of Cars)',
				author: 'Luke Smith',
				description:
					'The Story of Porsche is a compact and beautifully designed review of the iconic car manufacturer.',
				price: 13.25,
				isbn: '',
				stock: 10,
				coverImage:
					'https://m.media-amazon.com/images/I/51WMOq-AB6L._SL1500_.jpg',
				categoryId: transportation.id
			},
			{
				title: 'The Story of Lamborghini: A tribute to automotive excellence (The Story of Cars)',
				author: 'Stuart Codling',
				description:
					'The Story of Lamborghini is a pocket-sized and wonderfully designed celebration of this most astonishing of supercar manufacturers.',
				price: 13.44,
				isbn: '',
				stock: 10,
				coverImage:
					'https://m.media-amazon.com/images/I/611lpOYICnL._SL1500_.jpg',
				categoryId: designHistoryAndCriticism.id
			},
			{
				title: 'The Story of McLaren: A Tribute to Automotive Excellence (The Story of Cars)',
				author: 'Alex Kalinauckas',
				description:
					'Explore the revolutionary history of one of the biggest names in motorsport in this photographic tribute to McLaren.',
				price: 9.26,
				isbn: '',
				stock: 10,
				coverImage:
					'https://m.media-amazon.com/images/I/61LyndPG8bL._SL1500_.jpg',
				categoryId: automotive.id
			},
			{
				title: 'Porsche 911: 50 Years',
				author: 'Randy Leffingwell',
				description:
					'Best-selling author Randy Leffingwell celebrates a half-century of one of the world’s premiere sports cars, focusing on the major themes that have defined Porsche’s rear-engined wonder.',
				price: 40.04,
				isbn: '',
				stock: 10,
				coverImage:
					'https://m.media-amazon.com/images/I/71t0XES6ocL._SL1500_.jpg',
				categoryId: classicCars.id
			},
			{
				title: 'The Watch Book Rolex: 3rd updated and extended edition',
				author: 'Gisbert L. Brunner',
				description:
					'The ultimate standard work on the Rolex brand is going into a new edition.',
				price: 72.81,
				isbn: '',
				stock: 10,
				coverImage:
					'https://m.media-amazon.com/images/I/91tBH9EGmEL._SL1500_.jpg',
				categoryId: lifestyle.id
			},
			{
				title: 'Louis Vuitton: The Birth of Modern Luxury Updated Edition',
				author: 'Louis Vuitton: The Birth of Modern Luxury Updated Edition',
				description:
					'This updated edition of Louis Vuitton: The Birth of Modern Luxury—presented by Paul-Gérard Pasols, the former director of communications for Louis Vuitton and a longtime consultant for the company—describes the dramatic rise of the world’s finest luxury company.',
				price: 74.4,
				isbn: '',
				stock: 10,
				coverImage:
					'https://m.media-amazon.com/images/I/71jHrALLpKL._SL1318_.jpg',
				categoryId: fashionDesign.id
			},
			{
				title: 'Tom Ford',
				author: 'Tom Ford, Bridget Foley, Slava Mogutin, Anna Wintour',
				description:
					"A celebration of Tom Ford's design work for both Gucci and Yves Saint Laurent from 1994 to 2004, created with the designer’s full cooperation.",
				price: 43.24,
				isbn: '',
				stock: 10,
				coverImage:
					'https://m.media-amazon.com/images/I/71Ntk-b02IL._SL1500_.jpg',
				categoryId: fashionDesign.id
			},
			{
				title: "Architectural Digest at 100: Century of celebrity homes, iconic designers, and evolving American taste from Architectural Digest's archives.",
				author: 'Amy Astley, Architectural Digest',
				description:
					'A rich visual history celebrating a century of the magazine’s publication, Architectural Digest at 100 presents the best from the pages of the international design authority.',
				price: 19.99,
				isbn: '',
				stock: 10,
				coverImage:
					'https://m.media-amazon.com/images/I/818+1n0OF-L._SL1336_.jpg',
				categoryId: decorating.id
			},
			{
				title: 'Vanity Fair 100 Years: From the Jazz Age to Our Age',
				author: 'Graydon Carter',
				description:
					'Vanity Fair 100 Years showcases a century of personality and power, art and commerce, crisis and culture—both highbrow and low—in this collection of images that graced the pages of magazine, and some published for the very first time. "A stunning artifact." (New York Times Book Review)',
				price: 70.0,
				isbn: '',
				stock: 10,
				coverImage:
					'https://m.media-amazon.com/images/I/51Vj1VI+PgL._SL1276_.jpg',
				categoryId: lifestyle.id
			}
		]
	});
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
