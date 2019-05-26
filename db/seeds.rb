# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)


response = HTTParty.get('https://evbite.com/all-electric-cars-available-in-2018/'); nil
parsed_body = Nokogiri::HTML(response.body); nil
vehicles_table = parsed_body.css('#tablepress-8 tbody tr'); nil

vehicles = vehicles_table.map do |vehicle|
  {
      make: vehicle.css('.column-1').text.downcase,
      name: vehicle.css('.column-2').text,
      range: vehicle.css('.column-4').text.split(' ')[0]
  }
end


vehicles.each do |vehicle|
  puts "Creating #{vehicle}"
  Vehicle.find_or_create_by!(vehicle)
end