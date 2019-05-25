# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)


response = HTTParty.get('https://evbite.com/all-electric-cars-available-in-2018/'); nil
parsed_body = Nokogiri::HTML(response.body); nil
makes_table = parsed_body.css('#tablepress-8 tbody tr .column-1'); nil
cars_table = parsed_body.css('#tablepress-8 tbody tr'); nil

makes = makes_table.map { |make| {name: make.text}}.uniq
cars = cars_table.map do |car|
  min_range = car.css('.column-4').text.split(' ')[0]
  {
      make: car.css('.column-1').text.downcase,
      name: car.css('.column-2').text,
      range: min_range
  }
end

makes.each do |make|
  puts "Creating #{make}"
  Make.find_or_create_by!(make)
end

cars.each do |car|
  car[:make_id] = Make.send(car.delete(:make)).id
  puts "Creating #{car}"
  Car.find_or_create_by!(car)
end