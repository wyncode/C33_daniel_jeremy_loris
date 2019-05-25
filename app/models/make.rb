class Make < ApplicationRecord
    has_many :cars

    class << self
        
        def smart
            @smart ||= find_by(name: 'Smart')
        end

        def fiat
            @fiat ||= find_by(name: "Fiat")
        end
            
        def honda
             @honda ||= find_by(name: 'Honda')
        end

        def bmw
            @bmw ||= find_by(name: 'BMW')
        end

        def hyundai
            @hyundai ||= find_by(name: 'Hyundai')
        end

        def kia
            @kia ||= find_by(name: 'Kia')
        end 

        def ford
            @ford ||= find_by(name: 'Ford')
        end

        def volkswagen
            @volkswagen ||= find_by(name: 'Volkswagen')
        end

        def nissan
            @nissan ||= find_by(name: 'Nissan')
        end
        
        def tesla
            @tesla ||= find_by(name: 'Tesla')
        end

        def chevrolet
            @chevrolet ||= find_by(name: 'Chevrolet')
        end
        
        def jaguar
            @jaguar ||= find_by(name: 'Jaguar')
        end
    end
end
