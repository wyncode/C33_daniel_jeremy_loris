class CreateCars < ActiveRecord::Migration[6.0]
  def change
    create_table :cars do |t|
      t.string :name
      t.integer :range
      t.belongs_to :make, null: false, foreign_key: true

      t.timestamps
    end
  end
end
