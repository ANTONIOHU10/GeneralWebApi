using FluentAssertions;

namespace GeneralWebApi.UnitTests;

public class UnitTest1
{
    [Fact]
    public void Test1_ShouldPass_WhenBasicAssertionIsTrue()
    {
        // Arrange
        var expected = true;
        var actual = true;

        // Act
        // (No action needed for this simple test)

        // Assert
        Assert.True(actual);
        Assert.Equal(expected, actual);
    }

    [Fact]
    public void Test2_ShouldPass_WhenUsingFluentAssertions()
    {
        // Arrange
        var value = 42;
        var text = "Hello World";

        // Act
        // (No action needed for this simple test)

        // Assert
        value.Should().Be(42);
        value.Should().BeGreaterThan(0);
        text.Should().NotBeNullOrEmpty();
        text.Should().Contain("World");
    }

    [Fact]
    public void Test3_ShouldPass_WhenComparingValues()
    {
        // Arrange
        var number1 = 10;
        var number2 = 20;
        var sum = number1 + number2;

        // Act
        var result = sum;

        // Assert
        result.Should().Be(30);
        result.Should().BeGreaterThan(number1);
        result.Should().BeGreaterThan(number2);
    }
}
