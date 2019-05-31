class CreateVehicles < ActiveRecord::Migration[6.0]
  def change
    create_table :vehicles do |t|
      t.string :make
      t.string :name
      t.integer :range

      t.timestamps
    end
  end
end
 