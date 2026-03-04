// define a test collection named "Testcontainers" and bind SqlServerTestcontainerFixture
using GeneralWebApi.IntegrationTests.Infrastructure;

[CollectionDefinition("Testcontainers")]
public class TestcontainersCollection : ICollectionFixture<SqlServerTestcontainerFixture>
{
    // this class itself does not need to write any code, it is only used to let xUnit recognize the relationship between collection and fixture
}