
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class ProductRecommendationEngine:

    def __init__(self, products):
        self.products = pd.DataFrame(products)

        # Combine relevant product attributes
        self.products["features"] = (
            self.products["category"].fillna("") + " " +
            self.products["description"].fillna("") + " " +
            self.products["material"].fillna("")
        )

        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.feature_matrix = self.vectorizer.fit_transform(
            self.products["features"]
        )

    def recommend_alternatives(self, product_id, required_quantity, top_n=5):

        # Find the requested product
        requested = self.products[
            self.products["product_id"] == product_id
        ]

        if requested.empty:
            return {"error": "Product not found"}

        product_index = requested.index[0]

        # Calculate product similarity
        similarity_scores = cosine_similarity(
            self.feature_matrix[product_index],
            self.feature_matrix
        ).flatten()

        # Exclude original product and unavailable alternatives
        candidates = self.products[
            (self.products["product_id"] != product_id) &
            (self.products["stock"] >= required_quantity)
        ].copy()

        candidates["similarity"] = similarity_scores[candidates.index]

        # Rank alternatives using similarity and supplier pricing
        candidates["recommendation_score"] = (
            candidates["similarity"] * 0.75 +
            (1 / (1 + candidates["price"])) * 0.25
        )

        recommendations = candidates.sort_values(
            by="recommendation_score",
            ascending=False
        ).head(top_n)

        return recommendations[
            [
                "product_id",
                "product_name",
                "supplier",
                "price",
                "stock",
                "delivery_days",
                "similarity",
                "recommendation_score"
            ]
        ].to_dict(orient="records")


# Sample product catalogue
products = [
    {
        "product_id": 101,
        "product_name": "500ml Plastic Food Container",
        "category": "Food Packaging",
        "description": "Reusable food storage container for takeaway packaging",
        "material": "Plastic",
        "price": 8.5,
        "stock": 3000,
        "supplier": "Supplier A",
        "delivery_days": 2
    },
    {
        "product_id": 102,
        "product_name": "500ml Biodegradable Food Container",
        "category": "Food Packaging",
        "description": "Eco friendly takeaway food storage container",
        "material": "Biodegradable",
        "price": 10.0,
        "stock": 12000,
        "supplier": "Supplier B",
        "delivery_days": 3
    },
    {
        "product_id": 103,
        "product_name": "750ml Plastic Takeaway Box",
        "category": "Food Packaging",
        "description": "Large reusable food packaging box",
        "material": "Plastic",
        "price": 9.0,
        "stock": 15000,
        "supplier": "Supplier C",
        "delivery_days": 4
    },
    {
        "product_id": 104,
        "product_name": "500ml Paper Food Container",
        "category": "Food Packaging",
        "description": "Disposable paper takeaway food container",
        "material": "Paper",
        "price": 7.5,
        "stock": 8000,
        "supplier": "Supplier D",
        "delivery_days": 2
    },
    {
        "product_id": 105,
        "product_name": "Office Printer Paper",
        "category": "Stationery",
        "description": "A4 white paper for office printing",
        "material": "Paper",
        "price": 250,
        "stock": 5000,
        "supplier": "Supplier E",
        "delivery_days": 1
    }
]


if __name__ == "__main__":

    engine = ProductRecommendationEngine(products)

    results = engine.recommend_alternatives(
        product_id=101,
        required_quantity=5000,
        top_n=3
    )

    print("\nRecommended Alternative Products:\n")

    if isinstance(results, dict):
        print(results)
    else:
        for item in results:
            print(
                f"{item['product_name']} | "
                f"Supplier: {item['supplier']} | "
                f"Price: {item['price']} | "
                f"Stock: {item['stock']} | "
                f"Similarity: {item['similarity']:.2f}"
            )
